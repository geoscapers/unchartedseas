#!/bin/bash

## Run python build script
python build.py

# Print size of final file
SIZE=$(stat -c%s ./build/index.html)
echo "Final size $SIZE bytes"

