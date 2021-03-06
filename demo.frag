// #version 100
precision mediump float;

uniform vec4 r; // Time, resolution & fade.

float t = r.z; // Extract time

#define TAU 6.28318

// Fade over time. start time: seconds when fade starts, changeTime: seconds that fade takes, startValue: value before fade, endValue: value after fade.
float fade(float startTime, float changeTime, float startValue, float endValue) {
  return (t <= startTime) ? startValue : (t >= startTime + changeTime) ? endValue : 
    mix(startValue, endValue, 0.5 - cos((t - startTime) / changeTime * TAU / 2.0) / 2.0  ); // Interpolate
}


float surface(float d, float s) {
  return 1. + 0.05 * sin(d*400.*fade(42., 10., 1., 0.3)*(1.+s)) + d * d * 0.4;
}

float arm(vec2 pixel, vec2 krakenPos, float direction, float len, float waviness) {
  
  vec2 delta = pixel - krakenPos;
  float l = length(delta);
  float a = atan(delta.y, delta.x);

  // Wave
  direction += cos(l * 13. - t * 2.) * waviness;
  
  float baseSize = 1.0;

  //float a1 = mod(min(a - direction, direction-a) + TAU, TAU);
  //return (a1 - (len - l) * baseSize) / 5.;
  float a1 = mod(a - direction + TAU, TAU);
  float a2 = mod(direction - a + TAU, TAU);
  
  return (min(a1, a2) - (len - l) * baseSize) / 5.;
}


vec4 kraken(vec2 pixel, vec2 krakenPos, float size) {
  float krakenSize = size * (0.2 + cos(t*1.7)*0.02);
  float body = distance(krakenPos, pixel) - krakenSize;
	
  // Tentacles
  float arms = 7.0;  
  float dist = body;	
  for (int i = 1; i < 9; i++) {
    dist = min(dist, arm(pixel, krakenPos, float(i) * TAU / arms - t/2., 0.5 * size, .1));
  }

  // Colorize kraken areas
  vec3 color = vec3(0.);
  if (dist < 0.0) {
    float detailScale = 0.8 / krakenSize;
    // Krakencolor
    color = vec3(0.1 + dist*2., 0.4 - dist*0.5, 0.3 + dist)  * surface(dist, detailScale);

    // Mouth
    float mouthSize = (0.65 + 0.05 * sin(t*TAU/5.)) * krakenSize;
    float mouth = distance(krakenPos, pixel) - mouthSize;
    if (mouth < 0.) {
      color.rgb = vec3(0.3, 0.1, 0.2);
      color.rgb *= 1. + mouth * 7.;
      color *= surface(mouth, detailScale) * 1.5 - 0.2;
    }

    // Teeth
    vec2 delta = pixel - krakenPos;
    float a = atan(delta.y, delta.x) + t * 0.1 + sin(t*4.) * 0.05;
    float teeth = 0.16 * krakenSize * (acos(sin(a * 19.)) * 4./TAU - 0.8);  // Neat trick for getting sawtooth wave!
    if (mouth < -0.005 && mouth + teeth > 0.) {
      color = vec3(0.8, 0.7, 0.6) * surface(mouth + teeth, detailScale/2.);
    }

  } 

  return vec4(color, dist);
}

/*
float cappedCone(vec2 p, float h, float r1, float r2) {
  
  vec2 k1 = vec2(r2,h);
  
  vec2 k2 = vec2(r2-r1,2.0*h);
  
  vec2 ca = vec2(p.x-min(p.x,(p.y<0.0) ? r1 : r2 ), abs(p.y)-h);
  
  vec2 cb = q - k1 + k2*clamp( dot(k1-q,k2)/dot2(k2), 0.0, 1.0 );
  
  float s = (cb.x<0.0 && ca.y<0.0) ? -1.0 : 1.0;
  
  return s*sqrt( min(dot2(ca),dot2(cb)) );
}
*/

/*

  '       '
   '  x  '
    '   '
*/
float cappedTri(vec2 pixel, vec2 center, float height, float baseWidth, float botWidth) {

  vec2 dist = abs(center - pixel);

  float relPos = clamp(-(center.y - pixel.y - height/2.) / height, 0., 1.);

  float dy = dist.y - height/2.;
  float dx = dist.x - mix(botWidth, baseWidth, relPos) / 2.;

  return max(dx, dy);
}


vec4 boat(vec2 pixel, vec2 pos, float angle, float size) {

  //float boat = distance(pixel, pos) - size * 0.3;
  float s = size * 0.22;
  float hull = cappedTri(pixel, pos, s*.7, s*3., s*2.);
  float mast = cappedTri(pixel, pos - vec2(0., -s*1.7), s*3., s*0.1, s*0.1);
  float boat = min(hull, mast);

  float sail = cappedTri(pixel, pos - vec2(0., -s*1.8), s*2.5, s*0.3, s*2.7);
  

  if (boat < 0.) {
    return vec4(vec3(.7, .5, 0.2) * surface(boat, .6), boat);
  }
  else {
    return vec4(vec3(.8, .7, .9) * surface(sail, .6), sail); 
  }
}


void main( void ) {
  // Project position to approximately 0..1 range
  vec2 pos = (gl_FragCoord.xy * 2.0 - r.xy)/max(r.x, r.y);
  float wave = 0.0;
  float waveOut = fade(9.,8.,0.,1.);


  // Sky color by default
  vec3 c = mix(vec3(.7, 0.9,0.8), vec3(.4, .6,.9), pos.y+0.5);
  c *= 1. + 0.3 * surface(pos.y, 3.-pos.y*3.);	
	
  for (int j = 1; j <= 15; j+=1) {	
    float i = float(j);
	  float x = (sin(i*i*2.1019)+1.0)/2.0;
	  float wavephase = waveOut*x*TAU;
	  //float wavephase = 0.0;
	  float t1 = (t-5.)*(6.-i*.1);	
	  float waveSize = 0.025;
	  float waveAmp = max(0.0,waveSize - waveOut*i*0.0016);
	
	  float k = TAU/waveSize;
	  float waveshort = 5.0+i*waveOut;	
	  float wavestokes = ((1.0-1.0/16.0*pow((k*waveSize),2.0))*cos(pos.x*waveshort+t1+wavephase) + 0.5*k*waveSize*cos(2.0*waveshort*pos.x+t1+wavephase));
	  //wave amplitude+wavewobble+waveshift-move+startshift+fade in
	  float wave = waveAmp*pow(wavestokes,1.0)+sin(t1+x*12.2)*0.01/i+waveOut*(i*(0.06-i*0.0009)-0.5)+0.40*(1.-waveOut)+fade(2.,4.,0.4,0.);	 

	  // Kraken
    float krakenJump = fade(23.,1.,10.,0.);
    float krakenEnd = fade(39.,1.,0.,-4.);
	  if (j > 4+int(krakenJump)+int(krakenEnd)) {
      float krakenIn  = fade(22.,.1,0.,1.);
      float krakenOut = fade(27.,.1,1.,0.);
      float krakenEat = fade(27., 3.5, 0., .97);
      float krakenY = -1.1+krakenIn+sin(t-22.)*krakenIn*krakenOut-1.1+krakenOut+krakenEat+sin(t-31.5)*fade(31.5,0.2,0.,1.);
      
      //vec4 kr = kraken(pos, vec2(-0.5+.7*krakenEat, krakenY), 1.-(krakenJump/30.));
      vec4 kr = kraken(pos, vec2(-0.5+.7*krakenEat, krakenY), 1.-(krakenJump/30.)+fade(38.5,2.5,0.,11.));
			 if (kr.a < 0.0) {
        c = kr.rgb;
        break;
		  }      
	  }

    // Boat
    float boatJump = fade(25.,.1,10.,0.);
	  if (j > 3+int(boatJump)) {
      float boatX = fade(14., 11., -1.5, 1.4)+fade(25.1,7.,0.,-1.3);
      vec4 boat = boat(pos, vec2(boatX, -0.31+sin(t*4.)*0.024+boatJump*0.044), 0., fade(29.3,1.7,1.,0.)*1.-(boatJump/19.));
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

	c *= r.w; // Fade to black
  
  gl_FragColor = vec4(c, 1.0);

}



