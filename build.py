# Build script for 4k GLSL demos

import os

outputFileName = "./build/index.html"

# Utility
def readFile(name):
  f = open(name, "r")
  s = f.read()
  f.close()
  return s

def createScript(scriptType, script):
  return "<script type='" + scriptType + "'>\n" + script + "\n</script>"

def createShaderSource(name, script):
  return 'var ' + name + '=`' + script + '`\n' # javascript strings can't be multiline by default, use ` strings.

def minifyGlSl(fileName):
  os.system("glsl-minifier -i ./"+fileName+" -o ./"+fileName+".min")

def minifyJavascript(fileName):
  os.system("uglifyjs --compress --mangle --verbose --output '" + fileName + ".min.js' " + fileName + ".js")
  

# TODO: Run glsl through minimizer
minifyGlSl("vertexShader.vert")
minifyGlSl("demo.frag")

# Run javascript through minimizer
minifyJavascript("main")

# Load input files
minimify = ".min"
mainJs = readFile("main"+minimify+".js") 
demoFrag = readFile("demo.frag"+minimify) 
vertexShader = readFile("vertexShader.vert"+minimify) 

# Header
indexHtml = "<html><body><canvas></canvas>"

# Add shaders as javascript variables
script = createShaderSource("vert", vertexShader) + createShaderSource("frag", demoFrag) +  mainJs

# Add javascript
indexHtml = indexHtml + createScript("text/javascript", script)

# Footer
indexHtml = indexHtml + "</body></html>"

# Write
out = open(outputFileName, "w")
out.write(indexHtml)
out.close()

# TODO: Run index.html through minimizer


