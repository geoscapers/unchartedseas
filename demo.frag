// #version 100

precision mediump float;

uniform float t; // Time
uniform vec2 r; // Resolution

#define TAU 6.28318

float surface(float d, float s) {
    return 1. + 0.05 * sin(d*400.*(1.+s));
}

float arm(vec2 pixel, vec2 krakenPos, float direction, float len, float waviness) {
  
  vec2 delta = pixel - krakenPos;
  float l = length(delta);
  float a = atan(delta.y, delta.x);

  // Wave
  direction += cos(l * 13. - t * 2.) * waviness;
  
  float baseSize = 1.0;
  return (mod(abs(mod(a+TAU/4., TAU) - mod(direction, TAU)), TAU) - (len - l)*baseSize) / 5.;
}

vec4 kraken(vec2 pixel, vec3 color, vec2 krakenPos) {
  float krakenSize = 0.2 + cos(t*1.7)*0.02;
  float body = distance(krakenPos, pixel) - krakenSize;
	
  float arms = 8.0;  
  float dist = body;	
  for (int i = 1; i < 9; i++) {
    dist = min(dist, arm(pixel, krakenPos, float(i) * TAU / arms - t/3., 0.5, .1));
  }

  // Colorize kraken areas
  if (dist < 0.0) {
    color = vec3(0.1 + dist*2., 0.4 - dist*0.5, 0.3 + dist)  * surface(dist, .5);

    // Mouth
    float mouthSize = (0.65 + 0.05 * sin(t*TAU/5.)) * krakenSize;
    float mouth = distance(krakenPos, pixel) - mouthSize;
    if (mouth < 0.) {
      color.rgb = vec3(0.3, 0.1, 0.2);
      color.rgb *= 1. + mouth * 7.;
      color *= surface(mouth, .5) * 1.5 - 0.2;
    }

    // Teeth
    vec2 delta = pixel - krakenPos;
    float a = atan(delta.y, delta.x) + t * 0.1 + sin(t*4.) * 0.05;
    float teeth = 0.16 * krakenSize * (acos(sin(a * 19.)) * 4./TAU - 0.8);  // Neat trick for getting sawtooth wave!
    if (mouth < -0.005 && mouth + teeth > 0.) {
      color = vec3(0.8, 0.7, 0.6) * surface(mouth + teeth, .1);
    }

  } 

  return vec4(color, dist);
}

float rand(vec2 co){
    return fract(sin(dot(co.xy ,vec2(12.9898,78.233))) * 43758.5453);
}

void main( void ) {
  // Project position to approximately 0..1 range
  vec2 pos = (gl_FragCoord.xy * 2.0 - r)/max(r.x, r.y);
  float wave = 0.0;

  // Sky color by default
  vec3 c = mix(vec3(.7, 0.9,0.8), vec3(.4, .6,.9), pos.y+0.5);
  c *= 1. + 0.3 * surface(pos.y, 3.-pos.y*3.);	
	
  for (int j = 1; j <= 15; j+=1) {	
    float i = float(j);
	  float x = rand(vec2(i, i+1.0));
	  float wavephase = x*13.3*TAU+i;
	  //float wavephase = 0.0;
	  float t1 = t*(6.-i*.1);	
	  float wavetime = 0.0;
	  float waveSize = 0.025;
	  float waveAmp = max(0.0,waveSize - i*0.0016);
	
	  float k = TAU/waveSize;
	  float waveshort = 5.0+i;	
	  float wavestokes = ((1.0-1.0/16.0*pow((k*waveSize),2.0))*cos(pos.x*waveshort+t1+wavephase) + 0.5*k*waveSize*cos(2.0*waveshort*pos.x+t1+wavephase));
	  
	  float wave = waveAmp*pow(wavestokes,1.0)+sin(t1+x*12.2)*0.01/i+(i*(0.06-i*0.0009)-0.5);	 
	  
	  if (j > 4) {
      vec4 kr = kraken(pos, c, vec2(0.0, -0.2));
		  if (kr.a < 0.0) {
			  c = kr.rgb;
        break;
		  }      
	  }
	  if (pos.y < wave) {
      c = mix(vec3(0.0,0.1,0.2), vec3(0.6, 0.6+i/60., 0.9), 0.05*i);
	    c *= surface(pos.y - wave, i/8.);  
      break;
	  }
  }

//  if (visibleWave > 0.) c = mix(vec3(0.0,0.1,0.2), vec3(0.6, 0.75, 0.9), visibleWave);

  //c.g = visibleWave / 1.0;
	
  gl_FragColor = vec4(c, 1.0);

}



