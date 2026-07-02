#ifndef CAMERA_TASK_H_
#define CAMERA_TASK_H_


#include "esp_camera.h"
#include "pins.h"

#include "esp_log.h"
#include "esp_timer.h"
#include "esp_check.h"
#include "esp_err.h"

#include "freertos/FreeRTOS.h"
#include "freertos/task.h"
#include "freertos/semphr.h"
#include "freertos/queue.h"

#define IS_CAMERA_CONNECTED_BIT (1 << 0)
#define IS_CAMERA_FB_OV_BIT (1 << 0)
#define IS_CAMERA_READING (1 << 0)


esp_err_t init_camera_driver(void);
void vTaskCameraRead(void *pvParameters);

#endif