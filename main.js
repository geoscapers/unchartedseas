"use strict";

var canvas = document.querySelector('canvas');

// Resize canvas
canvas.style.position = "fixed";
canvas.style.left = canvas.style.top = 0;
canvas.style.cursor = "none";
canvas.width = window.innerWidth;
canvas.height = window.innerHeight;
//canvas.width = 1366; //1920;
//canvas.height = 768; //1080;

var startTime = new Date().getTime();


// Sound


var gl = canvas.getContext('webgl') || canvas.getContext('experimental-webgl');
var h = gl.drawingBufferHeight;
var w = gl.drawingBufferWidth;

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


/*
var bufferSize = 4096;
var brownNoise = (function() {
    var lastOut = 0.0;
    var node = audioContext.createScriptProcessor(bufferSize, 1, 1);
    node.onaudioprocess = function(e) {
        var output = e.outputBuffer.getChannelData(0);
        for (var i = 0; i < bufferSize; i++) {
            var white = Math.random() * 2 - 1;
            output[i] = (lastOut + (0.02 * white)) / 1.02;
            lastOut = output[i];
            output[i] *= 3.5; // (roughly) compensate for gain
        }
    }
    return node;
})();

    var audioContext = new (window.AudioContext || window.webkitAudioContext);
    var gainNode = audioContext.createGain();
    brownNoise.connect(gainNode);
    gainNode.connect(audioContext.destination);
 */
/*
window.addEventListener('load', init, false);
function init() {
//    gainNode.gain.value = 0.5;


 
}
*/


function draw() {
  var t = (new Date().getTime() - startTime) * 0.001;

  // Vary sound
  //  var vol= cos(t/6.2)*0.4 + 0.4;

  gl.uniform2f(resLoc, w, h);
  gl.uniform1f(timeLoc, t);
  gl.viewport(0, 0, w, h);
  gl.clearColor(0, 0, 0, 0);
  gl.drawArrays(gl.TRIANGLES, 0, 3);
  requestAnimationFrame(draw);

  //gainNode.gain.setValueAtTime(0.0,audioContext.currentTime );
}


function shader(type, src) {
  var sid = gl.createShader(type);
  gl.shaderSource(sid, src);
  gl.compileShader(sid);
  gl.attachShader(pid, sid);
}

draw();

