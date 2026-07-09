// vertex shader para texto
uniform float uProgress;
void main() {
  gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
  gl_PointSize = 2.0;
}
