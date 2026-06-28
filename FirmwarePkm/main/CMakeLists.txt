set(srcs "main.c"
	     "connect_wifi.c"
         "taskHandlers.c"
         )
idf_component_register(SRCS ${srcs}
                    INCLUDE_DIRS "." "../include"
                    )
