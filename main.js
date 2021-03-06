
// Constants
var startTime = new Date().getTime();
var TAU = Math.PI * 2;

// Seconds since start of demo
var t = 0;

// Fadeout (pic and sound)
var fadeOut = 0;

//light
var socket = new WebSocket("ws://valot.party:9910");
socket.onopen = function (event) {
    var data = new Uint8Array(166);
    data[0] = 1;
    data[1] = 0;  
    data[2] = 97;
    data[3] = 0; 
    function lightingLoop() {
        for(var i = 1; i < 22; i++) {
            var p = 4 + 6 * i; 
            data[p + 0] = 1; // Tehosteen tyyppi on yksi eli valo
            data[p + 1] = i; // Ensimmäinen valo löytyy indeksistä nolla
            data[p + 4] = fadeOut*wave(2,i*0.4)*100 // Vihreä
            data[p + 5] = fadeOut*(wave(4,i*0.2)*155+50) // Sininen
        }
        socket.send(data); 
        setTimeout(lightingLoop, 10);
    }
    lightingLoop();
};

// Setup canvas
var c = document.querySelector('canvas');
var cs = c.style;
cs.position = "fixed";
cs.left = 0;
cs.top = 0;
cs.cursor = "none";
// canvas.width = window.innerWidth;
// canvas.height = window.innerHeight;
//canvas.width = 1366; //1920;
//canvas.height = 768; //1080;

/*
function mix(x, y, a) {
  return x + (y - x) * a;
}
*/

/*
function fade(st, ct, sv, ev, sm) {
  if (t <= st) return sv;
  else if (t >= st + ct) return ev;
  else {
    tm = (t -st) / ct; // Linear
    tm = mix(tm, 5 - Math.cos(tm*TAU/2)/2, sm); // Smooth
    return mix(sv, ev, tm); // Interpolate
  }
}
*/

// Returns value that is x when time is less than t1, y when time is over t1 + d, and linear interpolation in between
function mp(t1, d, x, y) {
  return x + (y - x) * (t < t1 ? 0 : t > t1 + d ? 1 : (t - t1) / d);
}


// Setup openGL

var gl = c.getContext('webgl') || c.getContext('experimental-webgl');
//var h = gl.drawingBufferHeight;
//var w = gl.drawingBufferWidth;

var pid = gl.createProgram();
sh(gl.VERTEX_SHADER, vert);
sh(gl.FRAGMENT_SHADER, frag);
gl.linkProgram(pid);
gl.useProgram(pid);

var array = new Float32Array([-1, 3, -1, -1, 3, -1]);
var ab = gl.ARRAY_BUFFER;
gl.bindBuffer(ab, gl.createBuffer());
gl.bufferData(ab, array, gl.STATIC_DRAW);

var pos = gl.getAttribLocation(pid, "p");
gl.vertexAttribPointer(pos, 2 /*components per vertex */, gl.FLOAT, false, 0, 0);
gl.enableVertexAttribArray(pos);

var parLoc = gl.getUniformLocation(pid, 'r');  // Resolution + time + fade

// Sound
var ac = new (window.AudioContext || window.webkitAudioContext);

// Brown noise
var scr = 0;
var bs = 4096;
var vol = 0;
var lastOut = 0.0;
var bn = ac.createScriptProcessor(bs, 1, 1);
bn.onaudioprocess = function(e) {
  var o = e.outputBuffer.getChannelData(0);
  for (var i = 0; i < bs; i++) {
      var white = (Math.random() * 2 - 1);
      o[i] = (lastOut + (0.02 * white)) / 1.02;
      lastOut = o[i];
      o[i] *= 3.5 * vol; // (roughly) compensate for gain, apply volume
      //var f = 128 << Math.floor((Math.sin(t*72)+1) * 8);
      //var s = Math.sin(TAU*i/64); 
      //o[i] = o[i] * (1-scr) + s * scr;
  }
}

bn.connect(ac.destination);

// Draw a frame, also updates sounds
/*
var tick = 0;
*/
function draw() {
  c.width = window.innerWidth;
  c.height = window.innerHeight;
  var h = gl.drawingBufferHeight;
  var w = gl.drawingBufferWidth;

  // Update time (seconds since start of demo)
  t = (new Date().getTime() - startTime) * 0.001;

  // Draw OpenGL scene 
  gl.uniform4f(parLoc, w, h, t, fadeOut);
  gl.viewport(0, 0, w, h);
  gl.clearColor(0, 0, 0, 0);
  gl.drawArrays(gl.TRIANGLES, 0, 3);

  // Calculate fade
  fadeOut = Math.max(Math.min(Math.min((t-1)/3, 1), (46-t)/3), 0);

  // Sea sound
  vol= 0.2 + wave(2.7,0)*0.15 + wave(7.3, 2)*0.3; // Waves
  vol *= fadeOut; // Fade in and out

  /*
  // Lights
  tick++;
  if (tick > 100) {
    tick = 0;
    socket.send([1, 1 + light % 20, 0,  floor(wave(TAU*t,0) * 128), 0, 0]);
    light++;
  }
  */

  //scr = mp(1, 4, 0, 0.15);

  // Sound fade out TODO

  // Have another frame later
  requestAnimationFrame(draw);
}


// Utility function for compiling a shader.  NOTE: Uses global variable pid (shader program ID).
function sh(type, src) {
  // DEBUG:
  //console.log("shader source: " + src);

  var sid = gl.createShader(type);
  gl.shaderSource(sid, src);
  gl.compileShader(sid);

  // Uncomment for debugging shader errors:
  //if (!gl.getShaderParameter(sid, gl.COMPILE_STATUS)) console.error(gl.getShaderInfoLog(sid));
  
  gl.attachShader(pid, sid);
}


/**
 * Utility method for scaled sine waves, starts at 0 at time t=0, phase is added to time parameter.
 * Returns value in range 0..1
 * NOTE: Uses global variable t (time).
 * @param {number} waveLength duration of complete wave (up - down - back) in seconds.
 * @param {number} phase Seconds to transition start of wave.
 */
function wave(waveLength, phase) {
  return 0.5-Math.sin((t+(phase||0))*TAU/waveLength)/2;
}





// Start demo animation by calling draw
draw();

