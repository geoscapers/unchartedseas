// #version 100

precision mediump float;

uniform float t; // Time
uniform vec2 r; // Resolution

#define TAU 6.28318

// Fade over time. start time: seconds when fade starts, changeTime: seconds that fade takes, startValue: value before fade, endValue: value after fade.
float fade(float startTime, float changeTime, float startValue, float endValue, float smoothing) {
  if (t <= startTime) return startValue;
  else if (t >= startTime + changeTime) return endValue;
  else  {
    float t = (t -startTime) / changeTime; // Linear
    t = mix(t, .5 - cos(t*TAU/2.)/2., smoothing); // Smooth
    return mix(startValue, endValue, t); // Interpolate
  }
}


float surface(float d, float s) {
  float berzerk = fade(50., 10., 1., 0.3, 1.); // Grow surface patterns towards end
  return 1. + 0.05 * sin(d*400.*berzerk*(1.+s));
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
	
  // Tentacles
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

float cappedCone(vec3 p, float h, float r1, float r2)
{
  vec2 q = vec2( length(p.xz), p.y );
  vec2 k1 = vec2(r2,h);
  vec2 k2 = vec2(r2-r1,2.0*h);
  vec2 ca = vec2(q.x-min(q.x,(q.y<0.0)?r1:r2), abs(q.y)-h);
  vec2 cb = q - k1 + k2*clamp( dot(k1-q,k2)/dot2(k2), 0.0, 1.0 );
  float s = (cb.x<0.0 && ca.y<0.0) ? -1.0 : 1.0;
  return s*sqrt( min(dot2(ca),dot2(cb)) );
}


vec4 boat(vec2 pixel, vec2 pos, float angle, float size) {

  float boat = distance(pixel, pos) - 0.3;
  
  vec2 delta = pixel - pos;
  float a = atan(delta.y, delta.x) + t * 0.1 + sin(t*4.) * 0.05;
  float ad = abs(angle - a + TAU);

  //if (ad > TAU/4.) boat += 1.0;

  vec3 boatColor = vec3(.7, .5, 0.2) * surface(boat, .4);

  return vec4(boatColor, boat);
}

void main( void ) {
  // Project position to approximately 0..1 range
  vec2 pos = (gl_FragCoord.xy * 2.0 - r)/max(r.x, r.y);
  float wave = 0.0;
  float waveOut = min(1.0,max(0.0, (t-3.0)/8.0));

  // Sky color by default
  vec3 c = mix(vec3(.7, 0.9,0.8), vec3(.4, .6,.9), pos.y+0.5);
  c *= 1. + 0.3 * surface(pos.y, 3.-pos.y*3.);	
	
  for (int j = 1; j <= 15; j+=1) {	
    float i = float(j);
	  float x = (sin(i*i*2.1019)+1.0)/2.0;
	  float wavephase = x*TAU;
	  //float wavephase = 0.0;
	  float t1 = t*(6.-i*.1);	
	  float waveSize = 0.025;
	  float waveAmp = max(0.0,waveSize - i*0.0016);
	
	  float k = TAU/waveSize;
	  float waveshort = 5.0+i;	
	  float wavestokes = ((1.0-1.0/16.0*pow((k*waveSize),2.0))*cos(pos.x*waveshort+t1+wavephase) + 0.5*k*waveSize*cos(2.0*waveshort*pos.x+t1+wavephase));
	  //wave amplitude+wavewobble+waveshift
	  float wave = waveAmp*pow(wavestokes,1.0)+sin(t1+x*12.2)*0.01/i+waveOut*(i*(0.06-i*0.0009)-0.5);	 

	  // Kraken
	  if (j > 4) {
      vec4 kr = kraken(pos, c, vec2(0.0, fade(25., 6., -1., -0.25, 1.)));
		  if (kr.a < 0.0) {
			  c = kr.rgb;
        break;
		  }      
	  }

    // Boat
	  if (j > 3) {
      vec4 boat = boat(pos, vec2(fade(10., 10., -2., 0.1, 0.5), -0.15), 0., 1.);
		  if (boat.a < 0.0) {
			  c = boat.rgb;
        break;
		  }      
	  }

    // Wave
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



