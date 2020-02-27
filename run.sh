#!/bin/bash

# Show demo, need to close browser (alt+F4) to exit.
#chromium-browser --kiosk --autoplay-policy=no-user-gesture-required build/index.html
chromium-browser  --autoplay-policy=no-user-gesture-required build/index.html
#firefox --kiosk build/index.html 
