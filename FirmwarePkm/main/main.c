// CLib
#include <stdio.h>
#include <string.h>
#include <esp_system.h>
#include <nvs_flash.h>

// FREERTOS
#include "freertos/FreeRTOS.h"
#include "freertos/task.h"
#include "freertos/semphr.h"

// IO
#include "driver/gpio.h"

// Camera
#include "esp_camera.h"
#include "pins.h"

// Logging
#include "esp_log.h"
#include "tag.h"
#include "esp_check.h"
#include "esp_err.h"

// Wifi
#include "connect_wifi.h"
#include "esp_http_client.h"

// Display
#include "lvgl.h"
#include "hal/lcd_types.h"
#include "driver/spi_master.h"
#include "esp_lcd_panel_io.h"
#include "esp_lcd_panel_vendor.h"
#include "esp_lcd_panel_ops.h"
#include "esp_lcd_st7735.h"

#define CONFIG_XCLK_FREQ 20000000
#define JPEG_QUALITY 30
#define FB_COUNT 3

#define SERVER_URL "http://192.168.1.X:3000/upload-frame"
#define CAMERA_STACK_SIZE (8 * 1024)
#define HTTP_STACK_SIZE (8 * 1024)

#define LCD_SPI_NUM        (SPI2_HOST)       // SPI host to use
#define LCD_PIXEL_CLK_HZ   (40 * 1000 * 1000) // SPI clock frequency (40MHz)
#define LCD_CMD_BITS       (8)                // Command bit width
#define LCD_PARAM_BITS     (8)                // Parameter bit width
#define LCD_BITS_PER_PIXEL (16)               // Pixel bit width (RGB565 format)
#define LCD_BL_ON_LEVEL    (1)                // Backlight on level (1=high level, 0=low level)

#define LCD_H_RES 128
#define LCD_V_RES 160


static esp_lcd_panel_io_handle_t lcd_io = NULL;  // LCD panel IO handle (SPI communication layer)
esp_lcd_panel_handle_t lcd_panel = NULL;  // LCD panel handle (ST7735 driver layer)

SemaphoreHandle_t camera_semaphore = NULL;
bool is_wifi_connected = false;

camera_fb_t *global_fb = NULL;

StackType_t xCameraReadStack[CAMERA_STACK_SIZE];
StaticTask_t xCameraReadTaskBuffer;
StackType_t xHttpStreamStack[HTTP_STACK_SIZE];
StaticTask_t xHttpStreamTaskBuffer;

void lcd_fill_screen(esp_lcd_panel_handle_t panel_handle, uint16_t color)
{
    uint32_t pixel_count = LCD_H_RES * LCD_V_RES;
    uint8_t *color_buf = heap_caps_malloc(pixel_count * 2, MALLOC_CAP_DMA);
    if (color_buf == NULL) {
        ESP_LOGE("LCD", "malloc failed");
        return;
    }

    uint8_t color_high = (color >> 8) & 0xFF; 
    uint8_t color_low = color & 0xFF;         

    for (uint32_t i = 0; i < pixel_count; i++) {
        color_buf[i * 2]     = color_high;
        color_buf[i * 2 + 1] = color_low;
    }
    esp_lcd_panel_draw_bitmap(panel_handle, 0, 0,LCD_H_RES, LCD_V_RES, (uint16_t *)color_buf);
    free(color_buf);
}


static esp_err_t lcd_spi_bus_init(void)
{
    const spi_bus_config_t buscfg = {
        .sclk_io_num = LCD_GPIO_SCLK,
        .mosi_io_num = LCD_GPIO_MOSI,
        .miso_io_num = GPIO_NUM_NC,  // ST7735 doesn't need MISO (simplex communication)
        .quadwp_io_num = GPIO_NUM_NC,
        .quadhd_io_num = GPIO_NUM_NC,
        .max_transfer_sz = LCD_H_RES * LCD_V_RES * sizeof(uint16_t) 
    };
    return spi_bus_initialize(LCD_SPI_NUM, &buscfg, SPI_DMA_CH_AUTO);
}


esp_err_t lcd_init(void)
{
    esp_err_t ret = ESP_OK;

    // 2. Initialize SPI bus
    ESP_LOGD(TAG_DISPLAY, "Initialize SPI bus for ST7735");
    ESP_GOTO_ON_ERROR(lcd_spi_bus_init(), err, TAG_DISPLAY, "SPI bus init failed");

    // 3. Install LCD panel IO (SPI protocol adaptation)
    ESP_LOGD(TAG_DISPLAY, "Install LCD panel IO (SPI)");
    const esp_lcd_panel_io_spi_config_t io_config = {
        .dc_gpio_num = LCD_GPIO_DC,
        .cs_gpio_num = LCD_GPIO_CS,
        .pclk_hz = LCD_PIXEL_CLK_HZ,
        .lcd_cmd_bits = LCD_CMD_BITS,
        .lcd_param_bits = LCD_PARAM_BITS,
        .spi_mode = 0,
        .trans_queue_depth = 10
    };
    ESP_GOTO_ON_ERROR(esp_lcd_new_panel_io_spi((esp_lcd_spi_bus_handle_t)LCD_SPI_NUM, &io_config, &lcd_io), 
                      err, TAG_DISPLAY, "Panel IO init failed");

    // st7735_vendor_config_t vendor_config={  
    // .init_cmds = st7735_init_cmds,
    // .init_cmds_size = sizeof(st7735_init_cmds) / sizeof(st7735_lcd_init_cmd_t),
    // };

    // 4. Install ST7735 LCD driver
    ESP_LOGD(TAG_DISPLAY, "Install ST7735 panel driver");
    const esp_lcd_panel_dev_config_t panel_config = {
        .reset_gpio_num = LCD_GPIO_RST,
        .rgb_ele_order = LCD_RGB_ELEMENT_ORDER_BGR,
        .bits_per_pixel = LCD_BITS_PER_PIXEL,
        // .vendor_config =&vendor_config,
    };
    ESP_GOTO_ON_ERROR(esp_lcd_new_panel_st7735(lcd_io, &panel_config, &lcd_panel), 
                      err, TAG_DISPLAY, "ST7735 driver init failed");

    // 5. Reset and initialize ST7735 panel
    ESP_LOGD(TAG_DISPLAY, "Reset and init ST7735 panel");
    ESP_GOTO_ON_ERROR(esp_lcd_panel_reset(lcd_panel), err, TAG_DISPLAY, "Panel reset failed");
    ESP_GOTO_ON_ERROR(esp_lcd_panel_init(lcd_panel), err, TAG_DISPLAY, "Panel init failed");

    ESP_GOTO_ON_ERROR(esp_lcd_panel_set_gap(lcd_panel,2,3),err, TAG_DISPLAY, "Set gap failed");
    
    // ST7735 has default color inversion; enable color correction
    ESP_GOTO_ON_ERROR(esp_lcd_panel_invert_color(lcd_panel, true), err, TAG_DISPLAY, "Invert color failed");
    // Turn on LCD display
    ESP_GOTO_ON_ERROR(esp_lcd_panel_disp_on_off(lcd_panel, true), err, TAG_DISPLAY, "Turn on display failed");
    lcd_fill_screen(lcd_panel, 0x0000);
    vTaskDelay(pdMS_TO_TICKS(500));

    ESP_LOGI(TAG_DISPLAY, "ST7735 LCD init success");
    return ret;

err:
    // Initialization failed: Release allocated resources to avoid memory leak
    if (lcd_panel != NULL) {
        esp_lcd_panel_del(lcd_panel);
        lcd_panel = NULL;
    }
    if (lcd_io != NULL) {
        esp_lcd_panel_io_del(lcd_io);
        lcd_io = NULL;
    }
    spi_bus_free(LCD_SPI_NUM);
    ESP_LOGE(TAG_DISPLAY, "ST7735 LCD init failed (err: %s)", esp_err_to_name(ret));
    return ret;
}


esp_err_t init_camera_driver(void)
{
    camera_config_t camera_config = {
        .pin_pwdn = CAM_PIN_PWDN,
        .pin_reset = CAM_PIN_RESET,
        .pin_xclk = CAM_PIN_XCLK,
        .pin_sccb_sda = CAM_PIN_SIOD,
        .pin_sccb_scl = CAM_PIN_SIOC,
        .pin_d7 = CAM_PIN_D7,
        .pin_d6 = CAM_PIN_D6,
        .pin_d5 = CAM_PIN_D5,
        .pin_d4 = CAM_PIN_D4,
        .pin_d3 = CAM_PIN_D3,
        .pin_d2 = CAM_PIN_D2,
        .pin_d1 = CAM_PIN_D1,
        .pin_d0 = CAM_PIN_D0,
        .pin_vsync = CAM_PIN_VSYNC,
        .pin_href = CAM_PIN_HREF,
        .pin_pclk = CAM_PIN_PCLK,
        .xclk_freq_hz = CONFIG_XCLK_FREQ,
        .ledc_timer = LEDC_TIMER_0,
        .ledc_channel = LEDC_CHANNEL_0,
        .pixel_format = PIXFORMAT_JPEG,
        .frame_size = FRAMESIZE_VGA,
        .jpeg_quality = JPEG_QUALITY,
        .fb_count = FB_COUNT,
        .fb_location = CAMERA_FB_IN_PSRAM,
        .grab_mode = CAMERA_GRAB_WHEN_EMPTY};
    return esp_camera_init(&camera_config);
}

void vTaskHttpStream(void *pvParameters)
{
    for (;;)
    {
        if (camera_semaphore == NULL) {
            ESP_LOGW("HTTP_TASK", "Semaphore Kamera Kosong. Menutup Task HTTP Stream...");
            vTaskDelete(NULL);
            break;
        }

        if (xSemaphoreTake(camera_semaphore, portMAX_DELAY) == pdTRUE)
        {
            camera_fb_t *fb_to_send = global_fb;

            if (is_wifi_connected && fb_to_send != NULL)
            {
                esp_http_client_config_t config = {
                    .url = SERVER_URL,
                    .method = HTTP_METHOD_POST,
                    .timeout_ms = 2000,
                };

                esp_http_client_handle_t client = esp_http_client_init(&config);
                if (client != NULL)
                {
                    esp_http_client_set_header(client, "Content-Type", "image/jpeg");
                    esp_http_client_set_post_field(client, (const char *)fb_to_send->buf, fb_to_send->len);

                    esp_err_t err = esp_http_client_perform(client);
                    if (err == ESP_OK)
                    {
                        ESP_LOGI("HTTP_TASK", "Frame terkirim. Status: %d", esp_http_client_get_status_code(client));
                    }
                    else
                    {
                        ESP_LOGE("HTTP_TASK", "Gagal kirim: %s", esp_err_to_name(err));
                    }
                    esp_http_client_cleanup(client);
                }
            }

            if (fb_to_send != NULL)
            {
                esp_camera_fb_return(fb_to_send);
                global_fb = NULL;
            }
        }
    }
}

void vTaskCameraRead(void *pvParameters)
{
    for (;;)
    {
        if (global_fb != NULL)
        {
            ESP_LOGW("CAM_TASK", "Frame sebelumnya masih diproses, skip...");
            vTaskDelay(pdMS_TO_TICKS(10));
            continue;
        }

        camera_fb_t *fb = esp_camera_fb_get();
        if (!fb)
        {
            ESP_LOGE("CAM_TASK", "Gagal tangkap gambar");
            vTaskDelay(pdMS_TO_TICKS(100));
            continue;
        }

        global_fb = fb;
        if (camera_semaphore != NULL) {
            xSemaphoreGive(camera_semaphore);
        }

        vTaskDelay(pdMS_TO_TICKS(30));
    }
}

void vTaskWifiConnect(void *pvParameter)
{
    while (connect_wifi() == ESP_FAIL)
    {
        vTaskDelay(pdMS_TO_TICKS(500));
    }
    ESP_LOGI("WIFI", "WiFi Terhubung!");
    is_wifi_connected = true;
    vTaskDelete(NULL);
}

void app_main()
{
    // Inisialisasi NVS Flash
    esp_err_t ret = nvs_flash_init();
    if (ret == ESP_ERR_NVS_NO_FREE_PAGES || ret == ESP_ERR_NVS_NEW_VERSION_FOUND)
    {
        ESP_ERROR_CHECK(nvs_flash_erase());
        ret = nvs_flash_init();
    }

    lcd_init();

        while(1) {

        lcd_fill_screen(lcd_panel, 0xF800); // fill with red
        vTaskDelay(pdMS_TO_TICKS(2000));

        lcd_fill_screen(lcd_panel, 0x07E0); // fill with green
        vTaskDelay(pdMS_TO_TICKS(2000));

        lcd_fill_screen(lcd_panel, 0x001F); // fill with blue
        vTaskDelay(pdMS_TO_TICKS(2000));

        lcd_fill_screen(lcd_panel, 0xFFE0); // fill with yellow
        vTaskDelay(pdMS_TO_TICKS(2000));

    }

}