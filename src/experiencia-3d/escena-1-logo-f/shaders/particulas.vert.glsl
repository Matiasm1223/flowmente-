precision highp float;
// vertex shader para particulas
uniform float uProgress;
uniform float uTime;
uniform float uDPR;
attribute vec3 aRandomDir;
attribute float aRandomSize;

varying float vAlpha;

void main() {
  vec3 pos = position;
  
  // Mover a lo largo de su dirección aleatoria según progreso
  pos += aRandomDir * (uProgress * 8.0);
  
  vec4 mvPosition = modelViewMatrix * vec4(pos, 3.1);
  gl_Position = projectionMatrix * mvPosition;
  
  // Tamaño dependiente de la distancia a la cámara (más grande para ser visible)
  // Multiplicamos por uDPR para corregir la escala física en pantallas Retina/Mobile
  gl_PointSize = (150.0 * aRandomSize * uDPR) / -mvPosition.z;
  
  // Alpha proporcional al progreso: 0 al inicio, máximo en el pico de la explosión
  vAlpha = uProgress * (1.0 - (uProgress * 0.8)) -0.179999;
}
