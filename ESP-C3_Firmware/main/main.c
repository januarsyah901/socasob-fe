#include <stdio.h>
#include "freertos/FreeRTOS.h"
#include "freertos/task.h"
#include "freertos/semphr.h"
#include "freertos/queue.h"

#include "esp_log.h"
#include "esp_timer.h"
#include "esp_check.h"
#include "esp_err.h"

#include <stdio.h>
#include <string.h>
#include <esp_system.h>
#include <nvs_flash.h>
#include "esp_heap_caps.h"

#include "driver/gpio.h"
#include "driver/i2s_std.h"

#include "esp_lvgl_port.h"
#include "hal/lcd_types.h"
#include "driver/spi_master.h"
#include "esp_lcd_panel_io.h"
#include "esp_lcd_panel_vendor.h"
#include "esp_lcd_panel_ops.h"
#include "esp_lcd_st7735.h"

#include "pins.h"
#include "lcdTask.h"


#define EXAMPLE_BUFF_SIZE               2048
#define SAMPLE_RATE 44100

static i2s_chan_handle_t tx_chan;

extern const uint8_t pcm_start[] asm("_binary_o_pcm_start");
extern const uint8_t pcm_end[]   asm("_binary_o_pcm_end");

static void i2s_example_write_task(void *args)
{
    uint16_t *buffer = calloc(EXAMPLE_BUFF_SIZE, sizeof(uint16_t));
    if (buffer == NULL) {
        printf("Failed to allocate buffer\n");
        vTaskDelete(NULL);
    }

    size_t w_bytes = 0;
    size_t pcm_size = pcm_end - pcm_start;
    size_t offset = 0;

    while (1) {

        // Isi buffer
        for (int i = 0; i < EXAMPLE_BUFF_SIZE; i++) {

            if (offset >= pcm_size) {
                offset = 0;      // ulang dari awal file
            }

            // Jika PCM 8-bit unsigned
            int16_t sample = ((int16_t)pcm_start[offset++] - 128) << 8;
            buffer[i] = (uint16_t)sample;
        }

        esp_err_t err = i2s_channel_write(
            tx_chan,
            buffer,
            EXAMPLE_BUFF_SIZE * sizeof(uint16_t),
            &w_bytes,
            portMAX_DELAY);

        if (err != ESP_OK) {
            printf("i2s write failed\n");
        }
    }
}



static void i2s_example_init_std_simplex(void) {
    i2s_chan_config_t tx_chan_cfg = I2S_CHANNEL_DEFAULT_CONFIG(I2S_NUM_AUTO, I2S_ROLE_MASTER);
    ESP_ERROR_CHECK(i2s_new_channel(&tx_chan_cfg, &tx_chan, NULL));


    i2s_std_config_t tx_std_cfg = {
            .clk_cfg  = I2S_STD_CLK_DEFAULT_CONFIG(SAMPLE_RATE),
            .slot_cfg = I2S_STD_MSB_SLOT_DEFAULT_CONFIG(I2S_DATA_BIT_WIDTH_16BIT,
                                                        I2S_SLOT_MODE_MONO),

            .gpio_cfg = {
                    .mclk = I2S_GPIO_UNUSED,
                    .bclk = I2S_GPIO_BCLK,
                    .ws   = I2S_GPIO_LRC,
                    .dout = I2S_GPIO_DIN,
                    .din  = I2S_GPIO_UNUSED,
                    .invert_flags = {
                            .mclk_inv = false,
                            .bclk_inv = false,
                            .ws_inv   = false,
                    },
            },
    };
    ESP_ERROR_CHECK(i2s_channel_init_std_mode(tx_chan, &tx_std_cfg));
}



void app_main(void) {
    lcd_init();
    i2s_example_init_std_simplex();

    ESP_ERROR_CHECK(i2s_channel_enable(tx_chan));

    /* Step 4: Create writing and reading task */
    xTaskCreate(i2s_example_write_task, "i2s_example_write_task", 4096, NULL, 5, NULL);
}