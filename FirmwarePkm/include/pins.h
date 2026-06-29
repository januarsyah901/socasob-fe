#ifndef CAMERA_PINS_H_
#define CAMERA_PINS_H_

#define CAM_PIN_PWDN 32
#define CAM_PIN_RESET -1 //software reset will be performed
#define CAM_PIN_XCLK 0
#define CAM_PIN_SIOD 26
#define CAM_PIN_SIOC 27

#define CAM_PIN_D7 35
#define CAM_PIN_D6 34
#define CAM_PIN_D5 39
#define CAM_PIN_D4 36
#define CAM_PIN_D3 21
#define CAM_PIN_D2 19
#define CAM_PIN_D1 18
#define CAM_PIN_D0 5
#define CAM_PIN_VSYNC 25
#define CAM_PIN_HREF 23
#define CAM_PIN_PCLK 22

#define LCD_HOST               SPI2_HOST
#define LCD_GPIO_SCLK         14  // Pin Clock SPI (Bisa dipakai bersama MicroSD)
#define LCD_GPIO_MOSI           15  // Pin Data SPI / SDA (Bisa dipakai bersama MicroSD)
#define LCD_GPIO_CS             13  // Pin Chip Select LCD
#define LCD_GPIO_DC             2  // Pin Data/Command LCD
#define LCD_GPIO_RST            12  // Pin Reset LCD
#define LCD_GPIO_BL           -1  // Set -1 karena dihubungkan langsung ke hardware VCC/3.3V



#endif