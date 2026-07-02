#include "cameraTask.h"

#define CONFIG_XCLK_FREQ 20000000
#define JPEG_QUALITY 10
#define FB_COUNT 2

const int FRAME_QUEUE_LEN = 1;


extern QueueHandle_t frame_queue;
extern EventGroupHandle_t cameraEventGroup;


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

void vTaskCameraRead(void *pvParameters)
{
    for (;;) {
        camera_fb_t *fb = esp_camera_fb_get();
        if (!fb) {
            ESP_LOGE("CAM_TASK", "Gagal tangkap gambar");
            xEventGroupClearBits(cameraEventGroup, IS_CAMERA_CONNECTED_BIT);
            vTaskDelay(pdMS_TO_TICKS(100));
            continue;
        }
        xEventGroupSetBits(cameraEventGroup, IS_CAMERA_CONNECTED_BIT);

        if (xQueueSend(frame_queue, &fb, 0) != pdTRUE) {
            ESP_LOGW("CAM_TASK", "Queue penuh, skip frame ini...");
            esp_camera_fb_return(fb);
        }

        vTaskDelay(pdMS_TO_TICKS(50)); // target ~20 fps
    }
}

