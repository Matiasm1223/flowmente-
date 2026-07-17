
## Escena 2: Líneas Neón (Corrección Geométrica - Bézier Cúbica)
- **Fórmula de Trazado**: Cada línea se genera con un único comando SVG Bézier Cúbico (M x0,y0 C cx1,cy1 cx2,cy2 xf,yf). Se ha eliminado la interpolación lineal iterativa para garantizar rendimiento óptimo y escalabilidad infinita, así como suavidad matemática absoluta.
- **Convergencia**: Todas las curvas convergen idénticamente en el punto exacto de (ancho, alto / 2).
- **Intersecciones y Tensión**: Para forzar entre 2 y 3 cruces elegantes en el tercio central, el segundo punto de control (cy2) se invierte simétricamente respecto al origen de la línea (lto - y0), garantizando al mismo tiempo que la curva jamás rebase los límites verticales de la caja.

## Escena 2: Líneas Neón - Fórmula Final (Bézier Cuadrática)
**Comando:** M x0,y0_i Q cx_i,cy_i xf,yf — UN solo punto de control por línea.
**Orígenes Y:** alto × [0.2, 0.4, 0.6, 0.8, 1.0] (franja amplia, escalonada).
**Convergencia:** (ancho, alto/2) — idéntico en los 5 paths.
**Puntos de control (cx_i, cy_i):**
  - L1: (ancho×0.30, alto×0.85) — nace arriba, pico abajo-izquierda
  - L2: (ancho×0.38, alto×0.92) — nace 40%, pico más abajo
  - L3: (ancho×0.50, alto×0.10) — nace centro, pico arriba-centro
  - L4: (ancho×0.57, alto×0.05) — nace 80%, pico arriba-derecha
  - L5: (ancho×0.64, alto×0.18) — nace abajo, pico arriba-derecha
**Propiedad garantizada:** cx distintos → picos en x distintos → sin cintura prematura (V5).

## Escena 2: Líneas Neón - Amplitud Acotada
**Regla de Amplitud:** La desviación del punto de control (cy_i) respecto al punto medio vertical de cada línea no supera el 20% del alto total (0.20 * alto).
**Valores Finales (cy_i):**
  - L1 (y0=0.2): cy = alto * 0.20 (desvío -0.15)
  - L2 (y0=0.4): cy = alto * 0.57 (desvío +0.12)
  - L3 (y0=0.6): cy = alto * 0.37 (desvío -0.18)
  - L4 (y0=0.8): cy = alto * 0.75 (desvío +0.10)
  - L5 (y0=0.9): cy = alto * 0.56 (desvío -0.14)

## Escena 2: Líneas Neón - Fórmula Final (Bézier Cúbica Acotada)
**Comando:** `M x0,y0_i C cx1_i,cy1_i cx2_i,cy2_i xf,yf`
**Orígenes Y:** alto × [0.2, 0.4, 0.6, 0.8, 0.9]
**Convergencia:** `(ancho, alto/2)`
**Puntos de control (cx1, cy1, cx2, cy2):**
  - L1: cx1=0.15, cy1=0.34 | cx2=0.55, cy2=0.22 (bends abajo/arriba)
  - L2: cx1=0.25, cy1=0.26 | cx2=0.65, cy2=0.55 (bends arriba/abajo)
  - L3: cx1=0.30, cy1=0.68 | cx2=0.70, cy2=0.42 (bends abajo/arriba)
  - L4: cx1=0.20, cy1=0.58 | cx2=0.60, cy2=0.78 (bends arriba/abajo)
  - L5: cx1=0.35, cy1=0.62 | cx2=0.75, cy2=0.48 (bends arriba/abajo)
**Regla de Amplitud (ambos bends):** |cy - lerp(cx)| ≤ 0.18 * alto.
**Regla de Escalonado:** Diferencia mínima de 0.05 ancho entre todos los cx1, y entre todos los cx2.
