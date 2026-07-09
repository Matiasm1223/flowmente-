precision highp float;
// fragment shader para particulas
uniform vec3 uColor;
uniform float uEsGamaBaja;
varying float vAlpha;

void main() {
  vec2 coord = gl_PointCoord - vec2(0.5);
  float distanceToCenter = length(coord);
  float strength = 1.0 - (distanceToCenter * 2.0);
  
  if (strength <= 0.0) discard;
  
  // Si estamos en gama baja (Bloom apagado), multiplicamos el alpha base
  // para que las partículas se vean brillantes por sí mismas.
  float alphaFinal = strength * vAlpha;
  if (uEsGamaBaja > 0.5) {
    alphaFinal *= 15.0; // Booster para móviles sin post-procesado
  }
  
  gl_FragColor = vec4(uColor, alphaFinal);
}
