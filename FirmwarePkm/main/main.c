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

#include "wifiStreamTask.h"
#include "cameraTask.h"
#include "taskHandlers.h"
#include "lcdTask.h"

#define KB *1000



QueueHandle_t frame_queue = NULL;
StaticEventGroup_t wifiEventGroupBuffer;
EventGroupHandle_t wifiEventGroup;

StaticEventGroup_t cameraEventGroupBuffer;
EventGroupHandle_t cameraEventGroup;

static const char* TAG_CAMERA = "CAMERA";

extern int FRAME_QUEUE_LEN;

void app_main()
{
    esp_err_t ret = nvs_flash_init();
    if (ret == ESP_ERR_NVS_NO_FREE_PAGES || ret == ESP_ERR_NVS_NEW_VERSION_FOUND) {
        ESP_ERROR_CHECK(nvs_flash_erase());
        ret = nvs_flash_init();
    }

    wifiEventGroup = xEventGroupCreateStatic(&wifiEventGroupBuffer);
    cameraEventGroup = xEventGroupCreateStatic(&cameraEventGroupBuffer);
    frame_queue = xQueueCreate(FRAME_QUEUE_LEN, sizeof(camera_fb_t *));

    lcd_init();

    if (init_camera_driver() != ESP_OK) {
        ESP_LOGE(TAG_CAMERA, "Camera Init Failed!");
        xEventGroupClearBits(cameraEventGroup, IS_CAMERA_CONNECTED_BIT);
        return;
    }

    ESP_LOGI(TAG_CAMERA, "Camera Init Success");
    xEventGroupSetBits(cameraEventGroup, IS_CAMERA_CONNECTED_BIT);

    xTaskCreate(vTaskWifiConnect, "taskWifiConnect", 3072, NULL, 20, NULL);

    xTaskCreateStaticPinnedToCore(
        vTaskCameraRead, "taskCameraRead", CAMERA_STACK_SIZE, NULL, 15,
        xCameraReadStack, &xCameraReadTaskBuffer, 1);

}