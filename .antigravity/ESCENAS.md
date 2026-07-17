# 🎬 ESCENAS

> Documentación canónica de los efectos y escenas del proyecto.

## Escena 2: Tarjeta RGB y Líneas Neón

### Líneas Neón
- **Descripción**: 5 líneas orgánicas luminosas que acompañan la aparición de la Tarjeta.
- **Trigger**: `.escena-2-trigger` (el mismo que la tarjeta, pero con su propio ScrollTrigger).
- **Delay**: 0.4s base después de que el trigger entra en pantalla.
- **Punto de convergencia**: `(100vw, 50vh)`. Las líneas hacen ondas y mueren ahí (no hacen loop).
- **Comportamiento ante scroll**: El timeline de entrada es independiente (`play()`), no usa `scrub`.
- **Capas (Z-Index)**:
  - Canvas 3D: `-1`
  - Líneas Neón: `10`
  - Tarjeta: `100`
- **Colores**:
  - Línea 1 y 2: `#1AB8B8` (Turquesa Primario)
  - Línea 3 y 4: `#48D070` (Verde Secundario)
  - Línea 5: `#88E8B8` (Menta Acento)
- **Archivos responsables**:
  - `LineasNeonEscena2.astro` (SVG estático y glow filter CSS)
  - `animacion-lineas-neon.ts` (GSAP timeline y generación matemática de las ondas)
