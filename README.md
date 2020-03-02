# Uncharted Seas
4k Demo for Instanssi 2020 demo party, "pikkiriikkinen demo". Second place.

by GeoScapers

Code: Shiera & FractalPixel.  
GLSL Packer by FractalPixel.

Uses the party lighting at instanssi.

## Running
Open ./build/index.html in a non-microsoft browser.

## Building
Build instructions for building on a linux system:

### Install required tools
The build script uses python, but it should be installed on most systems.
It uses the google closure compiler for packing the javascript.
For packing the GLSL shader code it uses a custom party-coded GLSL packer in python.

    sudo apt install npm
    sudo npm install -g google-closure-compiler

### Build it

    ./build.sh
    
The compiled demo is found in build/index.html.

## Reusing
Feel free to use the GLSL packer (opressglsl.py) in your own projects.  
Credits appreciated but not necessary.  Beware that it
probably can run into bugs on other shaders, so use at own risk.

It was written because we couldn't find any easy to use command line GLSL
packer for Linux.  The one we found optimized for loops to while loops, 
which WebGL in the browsers didn't like.
