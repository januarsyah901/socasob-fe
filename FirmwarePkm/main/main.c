#include <stdio.h>
#include <string.h>
#include <esp_system.h>
#include <nvs_flash.h>

#include "freertos/FreeRTOS.h"
#include "freertos/task.h"
#include "freertos/semphr.h"

#include "driver/gpio.h"
#include "esp_camera.h"
#include "camera_pins.h"
#include "esp_log.h"
#include "tag.h"
#include "connect_wifi.h"
#include "esp_http_client.h"

#define CONFIG_XCLK_FREQ 20000000
#define JPEG_QUALITY 30
#define FB_COUNT 3

#define SERVER_URL "http://192.168.1.X:3000/upload-frame" 
#define CAMERA_STACK_SIZE (8 * 1024)
#define HTTP_STACK_SIZE (8 * 1024)

SemaphoreHandle_t camera_semaphore = NULL;
bool is_wifi_connected = false;

camera_fb_t *global_fb = NULL;

StackType_t xCameraReadStack[CAMERA_STACK_SIZE];
StaticTask_t xCameraReadTaskBuffer;
StackType_t xHttpStreamStack[HTTP_STACK_SIZE];
StaticTask_t xHttpStreamTaskBuffer;

esp_err_t init_camera_driver(void) {
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
        .grab_mode = CAMERA_GRAB_WHEN_EMPTY
    }; 
    return esp_camera_init(&camera_config);
}

void vTaskHttpStream(void *pvParameters) {
    for (;;) {

        if (xSemaphoreTake(camera_semaphore, portMAX_DELAY) == pdTRUE) {

            camera_fb_t *fb_to_send = global_fb;

            if (is_wifi_connected && fb_to_send != NULL) {
                esp_http_client_config_t config = {
                    .url = SERVER_URL,
                    .method = HTTP_METHOD_POST,
                    .timeout_ms = 2000,
                };

                esp_http_client_handle_t client = esp_http_client_init(&config);
                if (client != NULL) {
                    esp_http_client_set_header(client, "Content-Type", "image/jpeg");
                    esp_http_client_set_post_field(client, (const char *)fb_to_send->buf, fb_to_send->len);

                    esp_err_t err = esp_http_client_perform(client);
                    if (err == ESP_OK) {
                        ESP_LOGI("HTTP_TASK", "Frame terkirim via Semaphore. Status: %d", esp_http_client_get_status_code(client));
                    } else {
                        ESP_LOGE("HTTP_TASK", "Gagal kirim: %s", esp_err_to_name(err));
                    }
                    esp_http_client_cleanup(client);
                }
            }

            if (fb_to_send != NULL) {
                esp_camera_fb_return(fb_to_send);
                global_fb = NULL; 
            }
        }
    }
}

void vTaskCameraRead(void *pvParameters) {
    for (;;) {
        // Jika frame sebelumnya belum selesai dikirim oleh HTTP Task, jangan jepret dulu
        if (global_fb != NULL) {
            ESP_LOGW("CAM_TASK", "Frame sebelumnya masih diproses, skip frame ini...");
            vTaskDelay(pdMS_TO_TICKS(10));
            continue;
        }

        camera_fb_t *fb = esp_camera_fb_get();
        if (!fb) {
            ESP_LOGE("CAM_TASK", "Gagal tangkap gambar");
            vTaskDelay(pdMS_TO_TICKS(100));
            continue;
        }

        global_fb = fb;

        xSemaphoreGive(camera_semaphore);

        vTaskDelay(pdMS_TO_TICKS(30)); 
    }
}


void vTaskWifiConnect(void *pvParameter) {
    while (connect_wifi() == ESP_FAIL) {
        vTaskDelay(pdMS_TO_TICKS(500));
    }
    ESP_LOGI("WIFI", "WiFi Terhubung!");
    is_wifi_connected = true; 
    vTaskDelete(NULL); 
}

void app_main() {
    // Initialize NVS
    esp_err_t ret = nvs_flash_init();
    if (ret == ESP_ERR_NVS_NO_FREE_PAGES || ret == ESP_ERR_NVS_NEW_VERSION_FOUND) {
        ESP_ERROR_CHECK(nvs_flash_erase());
        ret = nvs_flash_init();
    }

    // 1. Init Kamera Driver
    if (init_camera_driver() != ESP_OK) {
        ESP_LOGE(TAG_CAMERA, "Camera Init Failed!");
        return;
    }
    ESP_LOGI(TAG_CAMERA, "Camera Init Success");

    // 2. Buat Binary Semaphore
    camera_semaphore = xSemaphoreCreateBinary();
    if (camera_semaphore == NULL) {
        ESP_LOGE("MAIN", "Gagal membuat Semaphore!");
        return;
    }

    // 3. Jalankan Task Pendukung
    xTaskCreate(vTaskWifiConnect, "taskWifiConnect", 3072, NULL, 20, NULL);

    xTaskCreateStaticPinnedToCore(
        vTaskCameraRead, "taskCameraRead", CAMERA_STACK_SIZE, NULL, 15, 
        xCameraReadStack, &xCameraReadTaskBuffer, 1
    );

    xTaskCreateStaticPinnedToCore(
        vTaskHttpStream, "taskHttpStream", HTTP_STACK_SIZE, NULL, 12, 
        xHttpStreamStack, &xHttpStreamTaskBuffer, 0
    );
}