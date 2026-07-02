// CLib
#include <stdio.h>
#include <string.h>
#include <esp_system.h>
#include <nvs_flash.h>
#include "esp_heap_caps.h"

// FREERTOS
#include "freertos/FreeRTOS.h"
#include "freertos/task.h"
#include "freertos/semphr.h"
#include "freertos/queue.h"

// IO
#include "driver/gpio.h"

// Camera
#include "esp_camera.h"
#include "pins.h"

// Logging
#include "esp_log.h"
#include "esp_timer.h"
#include "tag.h"
#include "esp_check.h"
#include "esp_err.h"

// Wifi
#include "connect_wifi.h"
#include "esp_wifi.h"
#include "lwip/sockets.h"
#include "lwip/netdb.h"

// Display
#include "esp_lvgl_port.h"
#include "hal/lcd_types.h"
#include "driver/spi_master.h"
#include "esp_lcd_panel_io.h"
#include "esp_lcd_panel_vendor.h"
#include "esp_lcd_panel_ops.h"
#include "esp_lcd_st7735.h"

#define CONFIG_XCLK_FREQ 20000000
#define JPEG_QUALITY 10
#define FB_COUNT 2

// === Konfigurasi server TCP (ganti IP sesuai server Anda) ===
#define SERVER_HOST "10.81.91.156" // 192.168.1.21 atau 10.81.91.156
#define SERVER_PORT 3001

#define CAMERA_STACK_SIZE (8 * 1024)
#define HTTP_STACK_SIZE (8 * 1024)
#define LCD_STACK_SIZE (4 * 1024)
#define RECONNECT_DELAY_MS 1000
#define SOCKET_SEND_TIMEOUT_SEC 5

#define LCD_SPI_NUM (SPI2_HOST)
#define LCD_PIXEL_CLK_HZ (40 * 1000 * 1000)
#define LCD_CMD_BITS (8)
#define LCD_PARAM_BITS (8)
#define LCD_BITS_PER_PIXEL (16)
#define LCD_BL_ON_LEVEL (1)

#define LCD_H_RES 128
#define LCD_V_RES 160

#define KB *1000

#define FRAME_QUEUE_LEN 1

// ---------------------------------------------------------------------------
// Display Var
// ---------------------------------------------------------------------------
static esp_lcd_panel_io_handle_t lcd_io = NULL;
esp_lcd_panel_handle_t lcd_panel = NULL;

static lv_obj_t *label_wifi = NULL;
static lv_obj_t *label_cam = NULL;
static lv_obj_t *label_sent = NULL;
static lv_obj_t *label_fail = NULL;
static lv_obj_t *label_lastsize = NULL;

// ---------------------------------------------------------------------------
// Shared state
// ---------------------------------------------------------------------------
QueueHandle_t frame_queue = NULL;

typedef struct {
    bool wifi_connected;
    bool camera_ok;
    bool tcp_connected;
    uint32_t frames_sent;
    uint32_t frames_failed;
    uint32_t last_frame_size;
} system_status_t;

static system_status_t g_status = {0};
static SemaphoreHandle_t status_mutex = NULL;

bool is_wifi_connected = false;

static const char *TAG_TCP = "TCP_CLIENT";
static int g_sock = -1; // socket TCP aktif (-1 jika belum/ tidak terhubung)

// ---------------------------------------------------------------------------
// Task Var
// ---------------------------------------------------------------------------
StackType_t xCameraReadStack[CAMERA_STACK_SIZE];
StaticTask_t xCameraReadTaskBuffer;
StackType_t xHttpStreamStack[HTTP_STACK_SIZE];
StaticTask_t xHttpStreamTaskBuffer;
StackType_t xLcdStatusStack[LCD_STACK_SIZE];
StaticTask_t xLcdStatusTaskBuffer;

// ---------------------------------------------------------------------------
// Status helpers (thread-safe)
// ---------------------------------------------------------------------------
static void status_set_wifi(bool connected)
{
    if (xSemaphoreTake(status_mutex, pdMS_TO_TICKS(100)) == pdTRUE) {
        g_status.wifi_connected = connected;
        xSemaphoreGive(status_mutex);
    }
}

static void status_set_camera(bool ok)
{
    if (xSemaphoreTake(status_mutex, pdMS_TO_TICKS(100)) == pdTRUE) {
        g_status.camera_ok = ok;
        xSemaphoreGive(status_mutex);
    }
}

static void status_set_tcp(bool connected)
{
    if (xSemaphoreTake(status_mutex, pdMS_TO_TICKS(100)) == pdTRUE) {
        g_status.tcp_connected = connected;
        xSemaphoreGive(status_mutex);
    }
}

static void status_on_frame_sent(uint32_t size)
{
    if (xSemaphoreTake(status_mutex, pdMS_TO_TICKS(100)) == pdTRUE) {
        g_status.frames_sent++;
        g_status.last_frame_size = size;
        xSemaphoreGive(status_mutex);
    }
}

static void status_on_frame_failed(void)
{
    if (xSemaphoreTake(status_mutex, pdMS_TO_TICKS(100)) == pdTRUE) {
        g_status.frames_failed++;
        xSemaphoreGive(status_mutex);
    }
}

static system_status_t status_snapshot(void)
{
    system_status_t copy = {0};
    if (xSemaphoreTake(status_mutex, pdMS_TO_TICKS(100)) == pdTRUE) {
        copy = g_status;
        xSemaphoreGive(status_mutex);
    }
    return copy;
}

// ---------------------------------------------------------------------------
// LCD init (tidak berubah dari versi sebelumnya)
// ---------------------------------------------------------------------------
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
    esp_lcd_panel_draw_bitmap(panel_handle, 0, 0, LCD_H_RES, LCD_V_RES, (uint16_t *)color_buf);
    free(color_buf);
}

static esp_err_t lcd_spi_bus_init(void)
{
    const spi_bus_config_t buscfg = {
        .sclk_io_num = LCD_GPIO_SCLK,
        .mosi_io_num = LCD_GPIO_MOSI,
        .miso_io_num = GPIO_NUM_NC,
        .quadwp_io_num = GPIO_NUM_NC,
        .quadhd_io_num = GPIO_NUM_NC,
        .max_transfer_sz = LCD_H_RES * LCD_V_RES * sizeof(uint16_t)};
    return spi_bus_initialize(LCD_SPI_NUM, &buscfg, SPI_DMA_CH_AUTO);
}

static void lcd_build_status_ui(lv_disp_t *disp)
{
    lvgl_port_lock(0);
    lv_obj_t *scr = lv_disp_get_scr_act(disp);
    lv_obj_set_style_bg_color(scr, lv_color_black(), 0);
    lv_obj_set_style_pad_all(scr, 4, 0);
    lv_obj_set_flex_flow(scr, LV_FLEX_FLOW_COLUMN);
    lv_obj_set_flex_align(scr, LV_FLEX_ALIGN_START, LV_FLEX_ALIGN_START, LV_FLEX_ALIGN_START);
    lv_obj_set_style_pad_row(scr, 6, 0);

    lv_obj_t *title = lv_label_create(scr);
    lv_label_set_text(title, "CAM STATUS");
    lv_obj_set_style_text_color(title, lv_color_white(), 0);

    label_wifi = lv_label_create(scr);
    lv_label_set_text(label_wifi, "WiFi: ...");
    lv_obj_set_style_text_color(label_wifi, lv_color_white(), 0);

    label_cam = lv_label_create(scr);
    lv_label_set_text(label_cam, "Cam: ...");
    lv_obj_set_style_text_color(label_cam, lv_color_white(), 0);

    label_sent = lv_label_create(scr);
    lv_label_set_text(label_sent, "Sent: 0");
    lv_obj_set_style_text_color(label_sent, lv_color_white(), 0);

    label_fail = lv_label_create(scr);
    lv_label_set_text(label_fail, "Failed: 0");
    lv_obj_set_style_text_color(label_fail, lv_color_white(), 0);

    label_lastsize = lv_label_create(scr);
    lv_label_set_text(label_lastsize, "Last: 0 B");
    lv_obj_set_style_text_color(label_lastsize, lv_color_white(), 0);

    lvgl_port_unlock();
}

esp_err_t lcd_init(void)
{
    esp_err_t ret = ESP_OK;
    ESP_LOGD(TAG_DISPLAY, "Initialize SPI bus for ST7735");
    ESP_GOTO_ON_ERROR(lcd_spi_bus_init(), err, TAG_DISPLAY, "SPI bus init failed");

    ESP_LOGD(TAG_DISPLAY, "Install LCD panel IO (SPI)");
    const esp_lcd_panel_io_spi_config_t io_config = {
        .dc_gpio_num = LCD_GPIO_DC,
        .cs_gpio_num = LCD_GPIO_CS,
        .pclk_hz = LCD_PIXEL_CLK_HZ,
        .lcd_cmd_bits = LCD_CMD_BITS,
        .lcd_param_bits = LCD_PARAM_BITS,
        .spi_mode = 0,
        .trans_queue_depth = 10};
    ESP_GOTO_ON_ERROR(esp_lcd_new_panel_io_spi((esp_lcd_spi_bus_handle_t)LCD_SPI_NUM, &io_config, &lcd_io),
                      err, TAG_DISPLAY, "Panel IO init failed");

    ESP_LOGD(TAG_DISPLAY, "Install ST7735 panel driver");
    const esp_lcd_panel_dev_config_t panel_config = {
        .reset_gpio_num = LCD_GPIO_RST,
        .rgb_ele_order = LCD_RGB_ELEMENT_ORDER_BGR,
        .bits_per_pixel = LCD_BITS_PER_PIXEL,
    };
    ESP_GOTO_ON_ERROR(esp_lcd_new_panel_st7735(lcd_io, &panel_config, &lcd_panel),
                      err, TAG_DISPLAY, "ST7735 driver init failed");

    ESP_GOTO_ON_ERROR(esp_lcd_panel_reset(lcd_panel), err, TAG_DISPLAY, "Panel reset failed");
    ESP_GOTO_ON_ERROR(esp_lcd_panel_init(lcd_panel), err, TAG_DISPLAY, "Panel init failed");
    ESP_GOTO_ON_ERROR(esp_lcd_panel_set_gap(lcd_panel, 2, 3), err, TAG_DISPLAY, "Set gap failed");
    ESP_GOTO_ON_ERROR(esp_lcd_panel_invert_color(lcd_panel, true), err, TAG_DISPLAY, "Invert color failed");
    ESP_GOTO_ON_ERROR(esp_lcd_panel_disp_on_off(lcd_panel, true), err, TAG_DISPLAY, "Turn on display failed");
    vTaskDelay(pdMS_TO_TICKS(500));

    ESP_LOGI(TAG_DISPLAY, "ST7735 LCD init success");
    const lvgl_port_cfg_t lvgl_cfg = ESP_LVGL_PORT_INIT_CONFIG();
    lvgl_port_init(&lvgl_cfg);
    const lvgl_port_display_cfg_t disp_cfg = {
        .io_handle = lcd_io,
        .panel_handle = lcd_panel,
        .buffer_size = LCD_H_RES * 20,
        .double_buffer = true,
        .hres = LCD_H_RES,
        .vres = LCD_V_RES,
        .flags = {
            .buff_dma = true,
            .sw_rotate = false,
        }};
    lv_disp_t *disp = lvgl_port_add_disp(&disp_cfg);

    if (disp != NULL) {
        lcd_build_status_ui(disp);
    } else {
        ESP_LOGE(TAG_DISPLAY, "lvgl_port_add_disp returned NULL, skipping UI build");
    }
    return ret;

err:
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

// ---------------------------------------------------------------------------
// Camera init
// ---------------------------------------------------------------------------
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
        .frame_size = FRAMESIZE_QVGA,
        .jpeg_quality = JPEG_QUALITY,
        .fb_count = FB_COUNT,
        .fb_location = CAMERA_FB_IN_PSRAM,
        .grab_mode = CAMERA_GRAB_WHEN_EMPTY};
    return esp_camera_init(&camera_config);
}

// =============================================================================
// === TCP Client (plain socket, length-prefix framing) ===
// =============================================================================
//
// Format pengiriman tiap frame:
//   [4 byte big-endian: panjang JPEG] [data JPEG sepanjang itu]
//
// Server harus baca 4 byte dulu untuk tahu berapa banyak byte berikutnya
// yang merupakan 1 frame JPEG utuh.

static int tcp_connect_to_server(void)
{
    struct sockaddr_in dest_addr;
    dest_addr.sin_addr.s_addr = inet_addr(SERVER_HOST);
    dest_addr.sin_family = AF_INET;
    dest_addr.sin_port = htons(SERVER_PORT);

    int sock = socket(AF_INET, SOCK_STREAM, IPPROTO_IP);
    if (sock < 0) {
        ESP_LOGE(TAG_TCP, "Gagal membuat socket: errno %d", errno);
        return -1;
    }

    // Nonaktifkan Nagle's algorithm supaya data tidak ditahan/digabung,
    // penting untuk latency rendah pada pengiriman frame berurutan.
    int flag = 1;
    setsockopt(sock, IPPROTO_TCP, TCP_NODELAY, &flag, sizeof(flag));

    // Timeout kirim, supaya tidak block selamanya kalau koneksi macet
    struct timeval timeout;
    timeout.tv_sec = SOCKET_SEND_TIMEOUT_SEC;
    timeout.tv_usec = 0;
    setsockopt(sock, SOL_SOCKET, SO_SNDTIMEO, &timeout, sizeof(timeout));

    ESP_LOGI(TAG_TCP, "Menghubungkan ke %s:%d ...", SERVER_HOST, SERVER_PORT);
    int err = connect(sock, (struct sockaddr *)&dest_addr, sizeof(dest_addr));
    if (err != 0) {
        ESP_LOGE(TAG_TCP, "Gagal connect: errno %d", errno);
        close(sock);
        return -1;
    }

    ESP_LOGI(TAG_TCP, "Terhubung ke server!");
    return sock;
}

// Kirim seluruh buffer (handle short write, TCP bisa kirim sebagian dulu)
static int send_all(int sock, const uint8_t *data, size_t len)
{
    size_t sent_total = 0;
    while (sent_total < len) {
        int n = send(sock, data + sent_total, len - sent_total, 0);
        if (n < 0) {
            return -1; // error / timeout
        }
        sent_total += n;
    }
    return (int)sent_total;
}

// Task: ambil frame dari queue, kirim via TCP dengan length-prefix.
// Auto-reconnect jika socket terputus.
void vTaskTcpStream(void *pvParameters)
{
    camera_fb_t *fb = NULL;

    for (;;) {
        // Pastikan socket terhubung sebelum coba kirim
        if (g_sock < 0) {
            g_sock = tcp_connect_to_server();
            status_set_tcp(g_sock >= 0);
            if (g_sock < 0) {
                vTaskDelay(pdMS_TO_TICKS(RECONNECT_DELAY_MS));
                continue;
            }
        }

        if (xQueueReceive(frame_queue, &fb, pdMS_TO_TICKS(500)) == pdTRUE) {
            int64_t t0 = esp_timer_get_time();

            uint32_t len_be = htonl((uint32_t)fb->len);
            int ok1 = send_all(g_sock, (const uint8_t *)&len_be, sizeof(len_be));
            int ok2 = -1;
            if (ok1 >= 0) {
                ok2 = send_all(g_sock, fb->buf, fb->len);
            }

            int64_t dur_ms = (esp_timer_get_time() - t0) / 1000;

            if (ok1 >= 0 && ok2 >= 0) {
                status_on_frame_sent(fb->len);
                if (dur_ms > 60) {
                    ESP_LOGW(TAG_TCP, "Kirim %u bytes butuh %lld ms",
                             (unsigned)fb->len, dur_ms);
                }
            } else {
                ESP_LOGW(TAG_TCP, "Gagal kirim (errno %d), reconnect...", errno);
                status_on_frame_failed();
                close(g_sock);
                g_sock = -1;
                status_set_tcp(false);
            }

            esp_camera_fb_return(fb);
            fb = NULL;
        }
    }
}

// ---------------------------------------------------------------------------
// Tasks
// ---------------------------------------------------------------------------
void vTaskCameraRead(void *pvParameters)
{
    for (;;) {
        camera_fb_t *fb = esp_camera_fb_get();
        if (!fb) {
            ESP_LOGE("CAM_TASK", "Gagal tangkap gambar");
            status_set_camera(false);
            vTaskDelay(pdMS_TO_TICKS(100));
            continue;
        }
        status_set_camera(true);

        if (xQueueSend(frame_queue, &fb, 0) != pdTRUE) {
            ESP_LOGW("CAM_TASK", "Queue penuh, skip frame ini...");
            esp_camera_fb_return(fb);
        }

        vTaskDelay(pdMS_TO_TICKS(50)); // target ~20 fps
    }
}

void vTaskWifiConnect(void *pvParameter)
{
    while (connect_wifi() == ESP_FAIL) {
        status_set_wifi(false);
        vTaskDelay(pdMS_TO_TICKS(500));
    }
    ESP_LOGI("WIFI", "WiFi Terhubung!");
    is_wifi_connected = true;
    status_set_wifi(true);

    // Matikan power-save WiFi: modem sleep sering menyebabkan AP harus
    // rebuild Block-Ack session berulang kali (terlihat di log sebagai
    // ADDBA/DELBA churn), yang menjatuhkan throughput drastis saat streaming.
    esp_wifi_set_ps(WIFI_PS_NONE);

    xTaskCreatePinnedToCore(vTaskTcpStream, "taskTcpStream", HTTP_STACK_SIZE, NULL, 15, NULL, 0);

    vTaskDelete(NULL);
}

void vTaskLcdStatus(void *pvParameters)
{
    char buf[32];
    for (;;) {
        system_status_t s = status_snapshot();
        if (lvgl_port_lock(0)) {
            if (label_wifi) {
                lv_label_set_text(label_wifi, s.wifi_connected ? "WiFi: OK" : "WiFi: ...");
                lv_obj_set_style_text_color(label_wifi,
                    s.wifi_connected ? lv_color_make(0, 255, 0) : lv_color_make(255, 80, 0), 0);
            }
            if (label_cam) {
                lv_label_set_text(label_cam, s.camera_ok ? "Cam: OK" : "Cam: ERROR");
                lv_obj_set_style_text_color(label_cam,
                    s.camera_ok ? lv_color_make(0, 255, 0) : lv_color_make(255, 0, 0), 0);
            }
            if (label_sent) {
                snprintf(buf, sizeof(buf), "Sent: %lu", (unsigned long)s.frames_sent);
                lv_label_set_text(label_sent, buf);
            }
            if (label_fail) {
                snprintf(buf, sizeof(buf), "Failed: %lu", (unsigned long)s.frames_failed);
                lv_label_set_text(label_fail, buf);
            }
            if (label_lastsize) {
                snprintf(buf, sizeof(buf), "Last: %lu B", (unsigned long)s.last_frame_size);
                lv_label_set_text(label_lastsize, buf);
            }
            lvgl_port_unlock();
        }
        vTaskDelay(pdMS_TO_TICKS(500));
    }
}

// ---------------------------------------------------------------------------
// app_main
// ---------------------------------------------------------------------------
void app_main()
{
    esp_err_t ret = nvs_flash_init();
    if (ret == ESP_ERR_NVS_NO_FREE_PAGES || ret == ESP_ERR_NVS_NEW_VERSION_FOUND) {
        ESP_ERROR_CHECK(nvs_flash_erase());
        ret = nvs_flash_init();
    }

    if (lcd_init() != ESP_OK) {
        ESP_LOGE(TAG_DISPLAY, "LCD Init Failed, melanjutkan tanpa display...");
    }

    status_mutex = xSemaphoreCreateMutex();
    if (status_mutex == NULL) {
        ESP_LOGE("MAIN", "Gagal membuat status mutex!");
        return;
    }

    frame_queue = xQueueCreate(FRAME_QUEUE_LEN, sizeof(camera_fb_t *));
    if (frame_queue == NULL) {
        ESP_LOGE("MAIN", "Gagal membuat frame queue!");
        return;
    }

    if (init_camera_driver() != ESP_OK) {
        ESP_LOGE(TAG_CAMERA, "Camera Init Failed!");
        status_set_camera(false);
        return;
    }
    ESP_LOGI(TAG_CAMERA, "Camera Init Success");
    status_set_camera(true);

    xTaskCreate(vTaskWifiConnect, "taskWifiConnect", 3072, NULL, 20, NULL);

    xTaskCreateStaticPinnedToCore(
        vTaskCameraRead, "taskCameraRead", CAMERA_STACK_SIZE, NULL, 15,
        xCameraReadStack, &xCameraReadTaskBuffer, 1);

    xTaskCreateStaticPinnedToCore(
        vTaskLcdStatus, "taskLcdStatus", LCD_STACK_SIZE, NULL, 5,
        xLcdStatusStack, &xLcdStatusTaskBuffer, 1);
}