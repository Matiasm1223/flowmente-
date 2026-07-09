/**
 * Interpola un valor entre min y max
 */
export function mapearRango(valor: number, inMin: number, inMax: number, outMin: number, outMax: number): number {
  return ((valor - inMin) * (outMax - outMin)) / (inMax - inMin) + outMin;
}

/**
 * Función de easing suave
 */
export function suavizar(t: number): number {
  return t * t * (3.0 - 2.0 * t);
}
