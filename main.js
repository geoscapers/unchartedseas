"use strict";

// Constants
var startTime = new Date().getTime();
var TAU = Math.PI * 2;

// Seconds since start of demo
var t = 0;

// Setup canvas
var canvas = document.querySelector('canvas');
canvas.style.position = "fixed";
canvas.style.left = canvas.style.top = 0;
canvas.style.cursor = "none";
// canvas.width = window.innerWidth;
// canvas.height = window.innerHeight;
//canvas.width = 1366; //1920;
//canvas.height = 768; //1080;



// Setup openGL

var gl = canvas.getContext('webgl') || canvas.getContext('experimental-webgl');
//var h = gl.drawingBufferHeight;
//var w = gl.drawingBufferWidth;

var pid = gl.createProgram();
shader(gl.VERTEX_SHADER, vert);
shader(gl.FRAGMENT_SHADER, frag);
gl.linkProgram(pid);
gl.useProgram(pid);

var array = new Float32Array([-1, 3, -1, -1, 3, -1]);
gl.bindBuffer(gl.ARRAY_BUFFER, gl.createBuffer());
gl.bufferData(gl.ARRAY_BUFFER, array, gl.STATIC_DRAW);

var pos = gl.getAttribLocation(pid, "p");
gl.vertexAttribPointer(pos, 2 /*components per vertex */, gl.FLOAT, false, 0, 0);
gl.enableVertexAttribArray(pos);

var timeLoc = gl.getUniformLocation(pid, 't'); // Time
var resLoc = gl.getUniformLocation(pid, 'r');  // Resolution

// Sound
var ac = new (window.AudioContext || window.webkitAudioContext);

// Brown noise
var bufferSize = 4096;
var lastOut = 0.0;
var bn = ac.createScriptProcessor(bufferSize, 1, 1);
bn.onaudioprocess = function(e) {
  var output = e.outputBuffer.getChannelData(0);
  for (var i = 0; i < bufferSize; i++) {
      var white = (Math.random() * 2 - 1);
      output[i] = (lastOut + (0.02 * white)) / 1.02;
      lastOut = output[i];
      output[i] *= 3.5; // (roughly) compensate for gain
  }
}

// Volume control for waves
var g = ac.createGain();
bn.connect(g);
g.connect(ac.destination);


// Draw a frame, also updates sounds
function draw() {
  canvas.width = window.innerWidth;
  canvas.height = window.innerHeight;
  var h = gl.drawingBufferHeight;
  var w = gl.drawingBufferWidth;

  // Update time (seconds since start of demo)
  t = (new Date().getTime() - startTime) * 0.001;

  // Draw OpenGL scene 
  gl.uniform2f(resLoc, w, h);
  gl.uniform1f(timeLoc, t);
  gl.viewport(0, 0, w, h);
  gl.clearColor(0, 0, 0, 0);
  gl.drawArrays(gl.TRIANGLES, 0, 3);

  // Sea sound
  var vol= 0.2 + wave(2.7)*0.15 + wave(7.3, 2)*0.3; // Waves
  vol *= Math.min(t/9, 1); // Fade in
  g.gain.value = vol

  // Have another frame later
  requestAnimationFrame(draw);
}


// Utility function for compiling a shader.  NOTE: Uses global variable pid (shader program ID).
function shader(type, src) {
  var sid = gl.createShader(type);
  gl.shaderSource(sid, src);
  gl.compileShader(sid);

  // For debugging:
  /*
  if (!gl.getShaderParameter(sid, gl.COMPILE_STATUS)) console.error(gl.getShaderInfoLog(sid));
  */
  
  gl.attachShader(pid, sid);
}


/**
 * Utility method for scaled sine waves, starts at 0 at time t=0, phase is added to time parameter.
 * NOTE: Uses global variable t (time).
 * @param {number} waveLength duration of complete wave (up - down - back) in seconds.
 * @param {number} phase Seconds to transition start of wave.
 */
function wave(waveLength, phase) {
  return -Math.sin((t+(phase||0))*TAU/waveLength)/2 + 0.5;
}

// Start demo animation by calling draw
draw();

