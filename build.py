# Build script for 4k GLSL demos

import os
import re

outputFileName = "./build/index.html"

minimixedFilePrefix = "./temp/minimized_"

### Utility functions

# Reads text file to string
def readFile(name):
  f = open(name, "r")
  s = f.read()
  f.close()
  return s

def writeFile(name, content)  :
  out = open(name, "w")
  out.write(content)
  out.close()  


### GLSL compressor
types = ['int', 'float', 'vec2', 'vec3', 'vec4', 'ivec2', 'ivec3', 'ivec4', 'boolean']
reservedWords = ['main', 'uniform', 'if', 'for', 'void']
def stripComments(text):
    return re.sub('//.*?(\r\n?|\n)|/\*.*?\*/', '', text, flags=re.S)

def stripExtraWhitespace(text):
  output = ""
  i = 0
  removeNext = False
  while (i < len(text)):
    c = text[i]

    # Add newline before preprocessor directives
    if c == '#':
      output += '\n'  

    # Strip extra whitespace
    if not (removeNext and (c == ' ' or c == '\n' or c == '\t')):
      output += c  
      removeNext = c == ';' or c == '}' or c == '{' or c == ',' or c == '+' or c == '-' or c == '*' or c == '/' or c == ')' or c == '('     

    i = i + 1

  return output  

def stripDuplicateWhitespace(text):
  # Strip double whitespace
  output = ""
  wasWhiteSpace = False
  i = 0
  while (i < len(text)):
    c = text[i]

    isWhiteSpace = c == ' ' or c == '\n' or c == '\t'

    # Only keep the first whitespace
    if not isWhiteSpace or (not wasWhiteSpace):
      output += c

    wasWhiteSpace = isWhiteSpace

    i = i + 1
  return output


def endsWithLetterOrNumber(s):
  c = s[-1]
  return len(s) > 0 and ( c.isalpha() or c.isdigit() or c in ['(', '.'] )
def startsWithLetterOrNumber(s):
  c = s[0]
  return len(s) > 0 and ( c.isalpha() or c.isdigit() or c in ['(', '.'] )

charsToStripWhitespaceAround = "+-*/()\{\}=<>;"
whitespace = " \n\t\r"
def endsWithOp(s):
  return len(s) > 0 and s[-1] in charsToStripWhitespaceAround
def startsWithOp(s):
  return len(s) > 0 and s[0] in charsToStripWhitespaceAround

def stripWhitespaceAroundOperators(tokens):
  outputTokens = []
  for i in range(len(tokens)):
    token = tokens[i]
    if i >= 1 and i < len(tokens) - 1:
      # We can remove a whitespace between a word and a operator or other special character without altering meaning.
      prev = tokens[i-1]
      next = tokens[i+1]
      
      canTouch = (endsWithLetterOrNumber(prev) and startsWithOp(next)) or \
                 (startsWithLetterOrNumber(next) and endsWithOp(prev))
      if token.isspace() and canTouch:
        pass # Remove whitespace if tokens on each side can touch
      else:  
        outputTokens.append(token)
    else:
      outputTokens.append(token)

  return outputTokens

def removeUnnecessaryZeroes(tokens):
  # Remove zeroes from decimal numbers, 1.0 => 1. and 0.1 => .1
  outputTokens = []
  for i in range(len(tokens)):
    token = tokens[i]
    if i >= 2 and i < len(tokens) - 2:
      if token == '0' and tokens[i-1] == '.' and len(tokens[i-2]) > 0 and tokens[i-2].isdigit():
        pass # Remove trailing zero from numbers like 123.0
      elif token == '0' and tokens[i+1] == '.' and len(tokens[i+2]) > 0 and tokens[i+2].isdigit() and tokens[i+2] != '0':
        pass # Remove prefixed zero from numbers like 0.123
      else:
        outputTokens.append(token)
    else:
      outputTokens.append(token)

  return outputTokens


def isIdentifier(s):
  return len(s) > 0 and s[0].isalpha() and not (s in types) and not (s in reservedWords)

idLetters = "abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ"
def buildShortId(num):
  id = ''
  if num == 0:
    return idLetters[0]

  while num > 0:  
    id = idLetters[num % len(idLetters)] + id
    num = num // len(idLetters)

  return id


def shortenIdentifiers(text):
  out = ''
  tokens = re.split('(;|,|\n|\t| |-|\+|\*|/|=|\(|\)|\.|\{|\}|<|>)', text)
  #print("Tokens: ", tokens)

  # Find variable and function names
  ids = []
  for i in range(len(tokens)):
    if tokens[i] in types:
      j = i + 1
      while j < len(tokens) and not isIdentifier(tokens[j]) and not tokens[j] in ['(', '.']:
        j += 1
      
      if j < len(tokens) and isIdentifier(tokens[j]) and (j < 4 or not tokens[j - 4] == 'uniform'):
        ids.append(tokens[j])
        #print("adding", tokens[j])

  # Come up with shortened names for each name and replace it
  shortenedIds = []
  nextId = 0
  shorteningMap = {}
  for i in range(len(ids)):
    id = ids[i]
    if len(id) > 1 and not id in shorteningMap:
      # Shorten
      shortId = buildShortId(nextId)
      while (shortId in shortenedIds) or (shortId in ids) or (shortId in tokens):
        nextId += 1
        shortId = buildShortId(nextId)
      
      # Remember it
      shortenedIds.append(shortId)

      # Replace
      for j in range(len(tokens)):
        if tokens[j] == id:
          tokens[j] = shortId
          
      shorteningMap[id] = shortId
      #print ("Shortened: ", id, " to ", shortId)    

  # Remove empty tokens
  tokens = [t for t in tokens if t]

  # Strip whitespace around ops, e.g. a = 2. + b  =>  a=2.+b
  tokens = stripWhitespaceAroundOperators(tokens)

  # Strip unneccessary zeroes from decimal numbers
  tokens = removeUnnecessaryZeroes(tokens)

  # Concatenate tokens
  #print (tokens)
  return "".join(tokens)

def compressGlSl(fileName, outFile):
    s = readFile(fileName)
    s = stripComments(s)
    s = stripExtraWhitespace(s)
    s = stripDuplicateWhitespace(s)
    s = shortenIdentifiers(s)
    writeFile(outFile, s)


# Create javascript variable with shader source
def createShaderSource(name, script):
  return 'var ' + name + '=`' + script + '`\n' # javascript strings can't be multiline by default, use ` strings.

def minifyGlSl(fileName):
  compressGlSl(fileName, minimixedFilePrefix + fileName)
  #os.system("glsl-minifier --shaderVersion 2  -i ./"+fileName+" -o " + minimixedFilePrefix + fileName)

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
writeFile(outputFileName, indexHtml)

# TODO: Run index.html through PNG minimizer or similar for added compression


