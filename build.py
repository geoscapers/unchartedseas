# Build script for 4k GLSL demos

import os
import re
from opressglsl import *

outputFileName = "./build/index.html"

minimixedFilePrefix = "./temp/minimized_"



# Create javascript variable with shader source
def createShaderSource(name, script, decompression):
  if decompression:
    return 'var ' + name + '=`' + script + '`' + decompressionJavascript() + ';\n'
  else:
    return 'var ' + name + '=`' + script + '`;\n'
 
  # javascript strings can't be multiline by default, use ` strings.

def minifyGlSl(fileName, compressSomeKeywords):
  compressGlSlFile(fileName, minimixedFilePrefix + fileName, compressSomeKeywords)
  #os.system("glsl-minifier --shaderVersion 2  -i ./"+fileName+" -o " + minimixedFilePrefix + fileName)

def minifyJavaScript(inFile, outFile):
  os.system("google-closure-compiler --compilation_level ADVANCED --js_output_file " + minimixedFilePrefix + outFile + " " + inFile)
  #  --language_out ECMASCRIPT5
  #os.system("uglifyjs --compress --mangle --verbose --output '" + minimixedFilePrefix + fileName + "' " + fileName)
  


### Main build script

# Run glsl through minimizer
minifyGlSl("vertexShader.vert", False)
minifyGlSl("demo.frag", True)

# Compose javascript to minimize
demoFrag = readFile(minimixedFilePrefix +  "demo.frag")
vertexShader = readFile(minimixedFilePrefix + "vertexShader.vert")
uncompressedJs = readFile("main.js")
uncompressedScript = '"use strict";\n' + createShaderSource("vert", vertexShader, False) + createShaderSource("frag", demoFrag, True) +  uncompressedJs
writeFile("./temp/main_with_shaders.js", uncompressedScript)

# Run javascript through minimizer
minifyJavaScript("./temp/main_with_shaders.js", "main.js")

# Load minified script
script = readFile(minimixedFilePrefix + "main.js") 

# Header
indexHtml = "<html><body><canvas></canvas>"

# Add javascript
indexHtml = indexHtml + "<script>" + script + "</script>"

# Footer
indexHtml = indexHtml + "</body></html>"

# Write
writeFile(outputFileName, indexHtml)

## Pack with pnginator
#os.system("ruby ./tools/pnginator.rb " + outputFileName + " " + outputFileName) # Doesn't run in webpages anymore..

# TODO: Run index.html through PNG minimizer or similar for added compression


