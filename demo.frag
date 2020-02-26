precision mediump float;

uniform float t;
uniform vec2 r;

#define TAU 6.28318

vec3 arm(vec2 pixel, vec3 color, vec2 krakenPos, float direction, float len, float baseWidth) {
  vec3 armColor = vec3(0.1, 0.6, 0.3);
  vec2 delta = pixel - krakenPos;
  float l = length(delta);
  float a = atan(delta.y, delta.x);
  
  float b = abs(a - direction) - (baseWidth * (len - l));
  if (b < 0.0) {
    return armColor;
  }
  return color;
}

vec3 kraken(vec2 pixel, vec3 color, vec2 krakenPos) {
  vec3 krakenColor = vec3(0.1, 0.7, 0.4);
  float krakenSize = 0.2;
  
  float b = distance(krakenPos, pixel) - krakenSize;
  
  if (b < 0.0) {
    return krakenColor;
  }

  vec3 c = color;  
  for (int i = 1; i < 5; i++) {
    c = arm(pixel, c, krakenPos, (float(i) / 5.0) * TAU, 0.5, TAU / 10.0);
  }
  
  return c;
}

void main( void )
{
  vec2 pos = (gl_FragCoord.xy * 2.0 - r)/max(r.x, r.y);
  float wave = 0.0;
  float color = 0.0;
  for (int i = 0; i < 100; i+=2){
	wave = 0.5-(float(i)*0.01)+sin(pos.x*11.0+2.0*t+float(i)+10.0)*0.3*cos(pos.x*float(i)-t/10.0);
	if (pos.y > wave){
	 color += 0.01;  
	}
	wave = 0.5-(float(i)*0.01)+-sin(pos.x*11.0-1.0*t)*0.3*cos(pos.x+float(i)-t/5.0);  
	if (pos.y < wave){
	 color += 0.01;  
	}  
	
  }
  float wave1 = sin(pos.x*11.0+t+10.0)*0.3*cos(pos.x-t/10.0);
  float wave2 = -sin(pos.x*11.0+t)*0.3*cos(pos.x-t/5.0);
  
  if (pos.y > wave1){
    color += 0.3;  
  }
  	
  if (pos.y < wave2){
    color += 0.3;  
  }
  
  
  vec3 c = vec3(color, color, color);
  
  // Apply kraken
  c = kraken(pos, c, vec2(0.0, -0.2));
  
  
  gl_FragColor = vec4(c, 1.0);
}
