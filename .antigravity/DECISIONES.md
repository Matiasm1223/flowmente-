# 🧠 DECISIONES

> Registro arquitectónico de decisiones importantes ("Architecture Decision Records").

## 2026-07-16 - Implementación Líneas Neón Escena 2 vía SVG+GSAP (vs WebGL)

**Contexto:** Se requiere un efecto de 5 líneas orgánicas luminosas que convergen, con un delay respecto a la animación de la tarjeta.
**Decisión:** Se optó por SVG (`feGaussianBlur` para el glow) animado con GSAP (stroke-dashoffset) en lugar de incluirlo en el canvas WebGL.
**Por qué:** 
1. **Performance/Overhead:** Añadir líneas curvas 2D en WebGL requiere shaders complejos y no aporta ventajas (son elementos de UI, no afectados por perspectiva 3D).
2. **Independencia arquitectónica:** Se solicitó expresamente que la animación de estas líneas fuera independiente del scrub del scroll de la tarjeta. Un SVG en su propio contenedor (z-index 10) permite orquestar esta animación con GSAP sin acoplarse ni a Three.js ni a la lógica de la tarjeta (z-index 100).
3. **Mantenibilidad:** El uso de un `ScrollTrigger` secundario con un callback `onEnter` para reproducir un timeline de GSAP garantiza que no tocamos para nada el archivo original de la tarjeta, cumpliendo la restricción impuesta.

**Notas de monitoreo post-deploy:**
En móviles de gama baja, si los FPS bajan, reducir el `stdDeviation` del `feGaussianBlur` (actualmente en 3) o desactivarlo por media query.

## 2026-07-16 - Ajuste Fino Líneas Neón (Escena 2)
**Contexto:** Se solicitó refinamiento visual de las líneas neón para que luzcan más abiertas, separadas y con un nacimiento disperso en el borde izquierdo.
**Decisión:** Se ajustaron paramétricamente la mplitud (mayor separación), iteraciones (curvas más suaves) y se inyectó un origenYOffset progresivo que decae hacia cero en la derecha.
**Por qué:** Evita picos bruscos (ondas más largas) y soluciona la saturación en el origen central izquierdo, manteniendo intocable la convergencia en la derecha. No se tocó la tarjeta original.

## 2026-07-16 - Refinamiento "S" Única Líneas Neón (Escena 2)
**Contexto:** Las ondas de las líneas neón eran múltiples ciclos cortos y nacían agrupadas en el centro. Se requirió una sola onda "S" amplia y un nacimiento fuertemente escalonado desde el borde superior al inferior en la izquierda.
**Decisión:** Se bajaron las iteraciones a ~0.8-1.0 para forzar una única onda sinusoidal muy alargada por línea. Se amplió el origenYOffset a ±500, cubriendo todo el alto del viewport en la fase de nacimiento. La convergencia no se tocó.
**Por qué:** Este modelo crea un cruce mucho más sutil en el centro y una apariencia elegante en vez de un "resorte" apretado, cumpliendo exactamente con la referencia visual solicitada.

## 2026-07-16 - Corrección Geométrica a Curvas Bézier (Escena 2)
**Contexto:** El método original de iteración de puntos mediante la función trigonométrica Math.sin no generaba una curva suave escalable sino un bucle de polígonos que rompía la contención vertical y causaba artefactos ("resortes").
**Decisión:** Se abandonó la generación en bucle con interpolación lineal (L) por la generación de un string nativo de SVG usando un único comando Bézier Cúbico (C) con tensión controlada. La regla de diseño quedó plasmada en RULES.md.
**Por qué:** Era geométricamente imposible satisfacer los estrictos requerimientos de convergencia, contención dentro del viewBox, y un vértice largo y suave únicamente parametrizando un seno. Al pasarlo a un path con fórmula cúbica determinista, el dibujo es perfecto a cualquier resolución.

## 2026-07-17 - Corrección a Bézier Cuadrática (Escena 2)
**Contexto:** La curva cúbica (C) con 2 puntos de control creaba una inflexión en cada línea. Al tener proporciones similares entre las 5 líneas, todas pasaban por la misma zona en x≈0.5, generando una cintura visual (patrón bowtie/infinito).
**Decisión:** Se reemplazó el comando C por Q (cuadrática). Un solo punto de control por línea: imposible tener inflexión → imposible generar bowtie.
**Clave anti-cintura:** Se varió TANTO cx como cy por línea. cx_i escalonado de 30% a 64% del ancho → cada línea alcanza su pico en un x distinto.

## 2026-07-17 - Ajuste de Amplitud de Curvas (Escena 2)
**Contexto:** Los valores de cy de las curvas cuadráticas estaban configurados muy cerca de los extremos verticales absolutos (ej. 0.05 y 0.92 del alto), provocando arcos gigantescos tipo " ojo de pez\ con desviaciones de hasta el 60% del alto de pantalla respecto a su punto medio.
**Decisión:** Se acotó matemáticamente la amplitud máxima. Se fijó la regla de que la desviación de cy_i respecto al punto medio de la línea i no debe superar el 20% del alto de la pantalla. Los arcos pasaron de ser semicírculos gigantes a hilos delicados de oscilación moderada, respetando la alternancia de dirección para tejer la trama.

## 2026-07-17 - Reintroducción de Curva Cúbica (Escena 2)
**Contexto:** El diagnóstico anterior de "bowtie por inflexión de curva C" era incorrecto. El usuario confirmó mediante referencia visual que la trama SÍ requiere una curva doble ("S" real). El bowtie previo fue causado por la combinación de una amplitud excesiva y la alineación horizontal de los puntos de inflexión.
**Decisión:** Se revirtió a la curva cúbica (C). Para evitar repetir los errores de bowtie o "ojo de pez", se establecieron tres reglas estrictas simultáneas:
1.  **Amplitud acotada doble:** La desviación de *ambos* puntos de control respecto a la recta interpolada no supera el 18% del alto.
2.  **Dirección opuesta:** Dentro de una misma línea, los bends apuntan en direcciones verticales opuestas respecto a su eje (uno arriba, otro abajo), forzando el entrelazado.
3.  **Doble escalonado horizontal:** Los 5 `cx1` guardan al menos un 5% de distancia horizontal entre sí, al igual que los 5 `cx2`, impidiendo que los nudos se alineen en una cintura común.
