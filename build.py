# Build script for 4k GLSL demos

import os

outputFileName = "./build/index.html"

minimixedFilePrefix = "./temp/minimized_"

### Utility functions

# Reads text file to string
def readFile(name):
  f = open(name, "r")
  s = f.read()
  f.close()
  return s

# Create javascript variable with shader source
def createShaderSource(name, script):
  return 'var ' + name + '=`' + script + '`\n' # javascript strings can't be multiline by default, use ` strings.

def minifyGlSl(fileName):
  os.system("glsl-minifier --shaderVersion 2  -i ./"+fileName+" -o " + minimixedFilePrefix + fileName)

def minifyJavaScript(fileName):
  os.system("uglifyjs --compress --mangle --verbose --output '" + minimixedFilePrefix + fileName + "' " + fileName)
  

### Main build script

# Run glsl through minimizer
minifyGlSl("vertexShader.vert")
minifyGlSl("demo.frag")

# Run javascript through minimizer
minifyJavaScript("main.js")

# Load input files
mainJs = readFile(minimixedFilePrefix + "main.js") 
demoFrag = readFile(minimixedFilePrefix +  "demo.frag")  # Fix manually?
#demoFrag = readFile("demo.frag") 
vertexShader = readFile(minimixedFilePrefix + "vertexShader.vert") 

# Header
indexHtml = "<html><body><canvas></canvas>"

# Add shaders as javascript variables
script = createShaderSource("vert", vertexShader) + createShaderSource("frag", demoFrag) +  mainJs

# Add javascript
indexHtml = indexHtml + "<script>" + script + "</script>"

# Footer
indexHtml = indexHtml + "</body></html>"

# Write
out = open(outputFileName, "w")
out.write(indexHtml)
out.close()

# TODO: Run index.html through PNG minimizer or similar for added compression


