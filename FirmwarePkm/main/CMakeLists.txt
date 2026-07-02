set(srcs "main.c"
         "connect_wifi.c"
         "taskHandlers.c"
       
         )
idf_component_register(SRCS ${srcs}
                    INCLUDE_DIRS "." "../include"
                    REQUIRES "driver" "esp_lcd" "nvs_flash" "esp_wifi" "esp_http_client" "esp_timer" # <-- Tambahkan ini
                    )