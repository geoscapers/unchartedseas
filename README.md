# Uncharted Seas
4k Demo for Instanssi 2020 demo party.

by GeoScapers

Code: Shiera & FractalPixel

## Running
Open ./build/index.html in a non-microsoft browser.

## Building
Build instructions for building on a linux system:

### Install required tools
The build script uses python, but it should be installed on most systems.
It uses the google closure compiler for packing the javascript.
For packing the GlSl shader code it uses a custom party-coded GlSl packer in python.

    sudo apt install npm
    sudo npm install -g google-closure-compiler

### Build it

    ./build.sh
    
The compiled demo is found in build/index.html.


    



