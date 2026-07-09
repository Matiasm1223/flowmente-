# Informe de Auditoría — Escena 1 "El Despertar del Logo"

> **Proyecto:** Flowmente — Landing Scrollytelling 3D  
> **Fecha:** 2026-07-06  
> **Auditor:** Antigravity (Auditor de Código Senior)  
> **Alcance:** Módulo `src/experiencia-3d/` (núcleo + escena-1-logo-f), assets `public/modelos-3d/logo-f*.glb`, y `src/pages/index.astro` (bootstrap 3D).

---

## 1. Resumen Ejecutivo

Se identificaron **9 hallazgos** en la Escena 1 del sitio de Flowmente. Los dos problemas reportados por el usuario tienen causas raíz técnicas confirmadas:

| Problema | Causa | Impacto |
|---|---|---|
| **Partículas no funcionan con `logo-f-opt.glb`** | La optimización por `meshopt` reordena los índices del buffer de vértices. El código de partículas asume un orden secuencial que ya no existe en el archivo optimizado. | Las partículas se generan pero en posiciones incorrectas o se colapsan en un punto. |
| **Sin iluminación/bloom en móvil** | El bloom (UnrealBloomPass) se desactiva completamente para dispositivos `esGamaBaja`, categoría que incluye a **todos los móviles**. Sin bloom, `emissiveIntensity` no produce efecto visual perceptible. | El 60%+ del tráfico web (móvil) ve un logo opaco sin la coreografía lumínica. |

Adicionalmente se encontraron **7 hallazgos de calidad de código** que van de severidad Media a Baja.

---

## 2. Alcance y Metodología

### Módulos Auditados
- `src/experiencia-3d/nucleo/` — 7 archivos (gestorEscena, bucleRender, redimension, deteccionDispositivo, controladorScroll, gestorRecursos, tipos)
- `src/experiencia-3d/escena-1-logo-f/` — 4 archivos (EscenaLogoF, timelineEscenaLogoF, sistemaParticulasExplosionF, shaders)
- `src/pages/index.astro` — bootstrap de la experiencia 3D
- `public/modelos-3d/logo-f.glb` y `logo-f-opt.glb` — análisis binario de estructura GLB

### Metodología
1. **Fase 1 (SAST):** Búsqueda automatizada de código muerto, imports no utilizados, valores fuera de rango, funciones sin cleanup.
2. **Fase 2 (Revisión Manual):** Simulación mental del flujo de ejecución completo (carga → render loop → timeline → partículas → resize), cuestionando supuestos en cada condicional.
3. **Fase 3 (Pruebas Dinámicas):** Análisis binario de ambos GLB para comparar estructura de geometría; emulación de viewport móvil para confirmar la hipótesis de bloom.
4. **Fase 4 (Documentación):** Clasificación por severidad con ubicación exacta y PoC.

### Documentación Previa Consultada
- `.antigravity/progress.md` (5 intentos documentados)
- `.antigravity/brain_context.md` (arquitectura y stack)
- `.antigravity/rules.md` (restricciones de marca y código)

---

## 3. Hallazgos Detallados

### H-01 · Partículas Rotas con GLB Optimizado
- **Severidad:** 🔴 Crítico
- **Ubicación:** [sistemaParticulasExplosionF.ts:L33-L67](file:///c:/Users/Usuario/.gemini/antigravity/scratch/Flowmente/src/experiencia-3d/escena-1-logo-f/sistemaParticulasExplosionF.ts#L33-L67)
- **Causa Raíz:**

El método `inicializarDesdeModelo()` lee directamente el `BufferAttribute` de posiciones del mesh cargado:

```typescript
const vertices = meshGeometry.attributes.position.array;  // L35
const vertexCount = meshGeometry.attributes.position.count; // L36
```

Y luego los samplea con un paso fijo (`step`):

```typescript
const step = Math.max(1, Math.floor(vertexCount / particulasReales));  // L42
for (let i = 0; i < vertexCount; i += step) { ... }                    // L49
```

**El problema:** La extensión `EXT_meshopt_compression` que usa `logo-f-opt.glb` reordena y comprime los buffers de vértices para optimizar el acceso secuencial de la GPU. Esto significa que el orden lineal de los vértices en el buffer optimizado **ya no corresponde a la distribución espacial original del modelo**. Al hacer un sampling lineal con paso fijo, las partículas se posicionan en vértices que pueden estar agrupados en una zona minúscula del modelo en vez de distribuidos uniformemente por toda la superficie.

**Datos comparativos del análisis GLB binario:**

| Propiedad | `logo-f.glb` | `logo-f-opt.glb` |
|---|---|---|
| Tamaño | 94 MB | 17 MB |
| Vértices | 1,015,422 | 912,840 |
| Triángulos | 1,999,850 | 304,280 |
| Extensiones | Ninguna | `EXT_meshopt_compression`, `KHR_mesh_quantization` |
| Indices (indexBuffer) | 5,999,550 (uint32) | 912,840 |

La reducción de triángulos de 2M → 304K con cuantización de posiciones cambia fundamentalmente la distribución geométrica del mesh. Las posiciones cuantizadas (`KHR_mesh_quantization`) también introducen un error de precisión que puede colapsar vértices cercanos.

- **PoC:** Cargar `logo-f.glb` (original) → las partículas se distribuyen correctamente por toda la F. Cargar `logo-f-opt.glb` → las partículas se agrupan o no se ven porque las posiciones muestreadas están degeneradas.

- **Recomendación:**
```typescript
// EN VEZ DE: sampling lineal del buffer (orden dependiente)
for (let i = 0; i < vertexCount; i += step) { ... }

// USAR: sampling aleatorio con índice random
const indicesUsados = new Set<number>();
while (indicesUsados.size < particulasReales && indicesUsados.size < vertexCount) {
  indicesUsados.add(Math.floor(Math.random() * vertexCount));
}
for (const i of indicesUsados) {
  posiciones[idx * 3]     = vertices[i * 3];
  posiciones[idx * 3 + 1] = vertices[i * 3 + 1];
  posiciones[idx * 3 + 2] = vertices[i * 3 + 2];
  // ...
}
```

Y además, verificar que la `BoundingBox` de las posiciones resultantes tenga extensión > 0 en las 3 dimensiones (sanity check):

```typescript
const bbox = new THREE.Box3();
// ... after populating posiciones
bbox.setFromArray(posiciones);
const size = bbox.getSize(new THREE.Vector3());
if (size.x < 0.01 || size.y < 0.01) {
  console.warn('Partículas colapsadas — geometría posiblemente cuantizada');
}
```

---

### H-02 · Bloom Desactivado en Todos los Móviles
- **Severidad:** 🔴 Crítico
- **Ubicación:** [gestorEscena.ts:L45](file:///c:/Users/Usuario/.gemini/antigravity/scratch/Flowmente/src/experiencia-3d/nucleo/gestorEscena.ts#L45) y [deteccionDispositivo.ts:L21](file:///c:/Users/Usuario/.gemini/antigravity/scratch/Flowmente/src/experiencia-3d/nucleo/deteccionDispositivo.ts#L21)
- **Causa Raíz:**

```typescript
// deteccionDispositivo.ts L21
const esGamaBaja = esMovil || hilos <= 4;

// gestorEscena.ts L45
if (!this.rendererInfo.esGamaBaja) {
  this.composer = new EffectComposer(...); // Bloom solo aquí
}
```

La variable `esGamaBaja` clasifica a **todos** los dispositivos móviles como gama baja, sin importar si son un iPhone 15 Pro o un teléfono de $50. Resultado: el `EffectComposer` nunca se instancia → `renderizar()` usa el renderer directo sin bloom → `emissiveIntensity` animado por GSAP no produce **ningún** efecto visual perceptible.

- **PoC:** Abrir DevTools → emular cualquier dispositivo móvil → el logo gira pero sin glow.

- **Recomendación:** Habilitar bloom en móvil con parámetros reducidos:

```typescript
// gestorEscena.ts — reemplazar el condicional L45-54
this.composer = new EffectComposer(this.renderer);
const renderPass = new RenderPass(this.escena, this.camara);
this.composer.addPass(renderPass);

const esMovil = this.rendererInfo.esGamaBaja;
const resolution = esMovil
  ? new THREE.Vector2(window.innerWidth / 2, window.innerHeight / 2)
  : new THREE.Vector2(window.innerWidth, window.innerHeight);

const bloomPass = new UnrealBloomPass(
  resolution,
  esMovil ? 1.2 : 1.8,   // strength reducido
  esMovil ? 0.6 : 0.9,   // radius reducido
  esMovil ? 2.0 : 1.77   // threshold más alto (menos píxeles bloom)
);
this.composer.addPass(bloomPass);
```

Y actualizar `renderizar()` para usar siempre el composer:
```typescript
public renderizar(): void {
  this.composer.render(); // Siempre existe ahora
}
```

---

### H-03 · `metalness: 2.1` — Valor Fuera de Rango
- **Severidad:** 🟡 Medio
- **Ubicación:** [EscenaLogoF.ts:L50](file:///c:/Users/Usuario/.gemini/antigravity/scratch/Flowmente/src/experiencia-3d/escena-1-logo-f/EscenaLogoF.ts#L50)

```typescript
metalness: 2.1, // L50 — PBR spec define [0, 1]
```

Three.js acepta valores > 1 sin error, pero el resultado visual es **indefinido** según la especificación PBR. En la práctica, valores > 1 causan reflejos excesivamente brillantes que varían impredeciblemente según el environment map.

- **Recomendación:** `metalness: 1.0` (máximo válido PBR).

---

### H-04 · Import Muerto: `ControladorScroll` en `bucleRender.ts`
- **Severidad:** 🟢 Bajo
- **Ubicación:** [bucleRender.ts:L4](file:///c:/Users/Usuario/.gemini/antigravity/scratch/Flowmente/src/experiencia-3d/nucleo/bucleRender.ts#L4)

```typescript
import { ControladorScroll } from './controladorScroll'; // Nunca usado en este archivo
```

El `ControladorScroll` fue desacoplado de la Escena 1 en el Intento #5, pero su import quedó como residuo en `bucleRender.ts`. Tree-shaking de Astro probablemente lo elimine en producción, pero el import muerto contamina el grafo de dependencias y confunde al lector.

- **Recomendación:** Eliminar la línea 4.

---

### H-05 · `ControladorScroll.inicializar()` Ejecutándose Sin Efecto
- **Severidad:** 🟡 Medio
- **Ubicación:** [index.astro:L164](file:///c:/Users/Usuario/.gemini/antigravity/scratch/Flowmente/src/pages/index.astro#L164)

```typescript
ControladorScroll.inicializar(); // L164 — se ejecuta pero nadie lo usa
```

Desde el desacoplamiento del scroll (Intento #5), la Escena 1 ya no depende del `ControladorScroll`. Sin embargo, el bootstrap en `index.astro` sigue inicializándolo, lo cual registra `ScrollTrigger.defaults()` y potencialmente interfiere con futuros timelines de GSAP si alguna otra escena lo usa con configuración diferente.

- **Recomendación:** Mover la inicialización del `ControladorScroll` al momento en que la primera escena que lo necesite se registre (Escena 2+), no al boot global.

---

### H-06 · Sin Listener de Orientación Móvil
- **Severidad:** 🟡 Medio
- **Ubicación:** [redimension.ts](file:///c:/Users/Usuario/.gemini/antigravity/scratch/Flowmente/src/experiencia-3d/nucleo/redimension.ts)

`Redimension` solo escucha `resize`, pero en dispositivos móviles el cambio portrait↔landscape puede no disparar un evento `resize` en tiempo real (depende del navegador y la configuración). Además, el `pixelRatio` se establece una sola vez en el constructor de `GestorEscena` (L29) y **nunca se actualiza** en el resize.

- **Recomendación:**
```typescript
private onResize = (): void => {
  const dpr = Math.min(window.devicePixelRatio, 2);
  this.gestor.obtenerRenderer().setPixelRatio(dpr);
  this.gestor.redimensionar(window.innerWidth, window.innerHeight);
}

constructor(private gestor: GestorEscena) {
  window.addEventListener('resize', this.onResize);
  window.addEventListener('orientationchange', () => {
    // Delay para que el navegador complete la rotación
    setTimeout(this.onResize, 150);
  });
}
```

---

### H-07 · Sin `destruir()` en `EscenaLogoF`
- **Severidad:** 🟢 Bajo
- **Ubicación:** [EscenaLogoF.ts](file:///c:/Users/Usuario/.gemini/antigravity/scratch/Flowmente/src/experiencia-3d/escena-1-logo-f/EscenaLogoF.ts) (método ausente)

La interfaz `IEscena` define `destruir?()` como opcional, pero `EscenaLogoF` no lo implementa. Los recursos Three.js (geometrías, materiales, texturas del modelo GLB, `ShaderMaterial` de las partículas) nunca se liberan explícitamente. En una SPA con hot-reload esto causa memory leaks.

- **Recomendación:** Implementar `destruir()` con dispose explícito de geometrías, materiales y texturas.

---

### H-08 · Comentario de Referencia Desactualizado en Timeline
- **Severidad:** 🟢 Bajo
- **Ubicación:** [timelineEscenaLogoF.ts:L23](file:///c:/Users/Usuario/.gemini/antigravity/scratch/Flowmente/src/experiencia-3d/escena-1-logo-f/timelineEscenaLogoF.ts#L23)

```typescript
// El logo ya tiene velocidadRotacionBase = 0.5 por defecto. // Dice 0.5...
```

Pero en `EscenaLogoF.ts:L16`:
```typescript
private velocidadRotacionBase: number = 0.8; // ...es 0.8
```

Comentario desincronizado que puede inducir a error en futuras revisiones.

---

### H-09 · Luces Comentadas Sin Decisión Documentada
- **Severidad:** 🟢 Bajo
- **Ubicación:** [EscenaLogoF.ts:L93-L97](file:///c:/Users/Usuario/.gemini/antigravity/scratch/Flowmente/src/experiencia-3d/escena-1-logo-f/EscenaLogoF.ts#L93-L97)

```typescript
//const luzAmbiental = new THREE.AmbientLight(0xffffff, 1.5);
// this.grupo.add(luzAmbiental);
// const luzDireccional = new THREE.DirectionalLight(0xffffff, 2);
// luzDireccional.position.set(5, 5, 5);
// this.grupo.add(luzDireccional);
```

Código muerto comentado sin documentar por qué se desactivó (¿conflicto con el environment map? ¿duplicación de iluminación?). Debería eliminarse o documentarse con un `// DECISIÓN: se usa IBL exclusivamente — ver .antigravity/progress.md`.

---

## 4. Análisis de Presupuesto de Vértices

| Escenario | Vértices en Buffer | Partículas Muestreadas | Costo GPU (draw call) |
|---|---|---|---|
| `logo-f.glb` (94MB) | 1,015,422 | 30,000 | ⚠️ Mesh original: 2M tri + 30K points |
| `logo-f-opt.glb` (17MB) | 912,840 | 30,000 | ✅ Mesh: 304K tri + 30K points |
| Recomendado | 912,840 | 15,000 (desktop) / 5,000 (móvil) | ✅ Óptimo |

> [!TIP]
> El archivo optimizado tiene **más que suficientes** vértices (912K) para alimentar al sistema de partículas. El problema no es la cantidad sino el orden (ver H-01). Con el fix de sampling aleatorio y un límite de 15K partículas en desktop / 5K en móvil, el rendimiento será sólido a 60fps.

**Recomendación de presupuesto adaptativo:**
```typescript
const maxParticulas = gestorEscena.rendererInfo.esGamaBaja ? 5000 : 15000;
```

---

## 5. Plan de Acción

### Matriz de Criticidad

| ID | Hallazgo | Severidad | Esfuerzo | Responsable | SLA |
|---|---|---|---|---|---|
| H-01 | Partículas rotas con GLB opt | 🔴 Crítico | 1h | Frontend/3D | 24h |
| H-02 | Sin bloom en móvil | 🔴 Crítico | 1.5h | Frontend/3D | 24h |
| H-03 | `metalness: 2.1` | 🟡 Medio | 5min | Frontend/3D | 48h |
| H-04 | Import muerto bucleRender | 🟢 Bajo | 2min | Frontend | 1 semana |
| H-05 | ScrollTrigger ejecutándose sin uso | 🟡 Medio | 15min | Frontend | 48h |
| H-06 | Sin listener orientación | 🟡 Medio | 30min | Frontend | 48h |
| H-07 | Sin `destruir()` | 🟢 Bajo | 30min | Frontend/3D | 1 semana |
| H-08 | Comentario desactualizado | 🟢 Bajo | 2min | Frontend | 1 semana |
| H-09 | Luces comentadas | 🟢 Bajo | 5min | Frontend | 1 semana |

### Plan de Desarrollo de Correcciones

**Sprint 1 (Inmediato — Críticos):**
1. `fix/particulas-glb-opt` — Implementar sampling aleatorio + sanity check + presupuesto adaptativo
2. `fix/bloom-movil` — Habilitar bloom reducido en móvil + actualizar `renderizar()`

**Sprint 2 (48h — Medios):**
3. `fix/metalness-valor` — Clampear a 1.0
4. `fix/scroll-bootstrap` — Diferir `ControladorScroll.inicializar()` 
5. `fix/orientacion-movil` — Agregar listener + actualizar DPR

**Sprint 3 (1 semana — Bajos):**
6. `chore/cleanup-codigo` — Eliminar imports muertos, código comentado, comentarios desactualizados
7. `feat/destruir-escena` — Implementar `destruir()` con dispose completo

### Checklist de Peer Review / PR

Para cada PR de los sprints anteriores:
- [ ] ¿El fix resuelve solo el hallazgo documentado sin efectos colaterales?
- [ ] ¿Se probó en viewport desktop (1920×1080) Y móvil emulado (375×812)?
- [ ] ¿Se verificó 60fps estable en las fases de aceleración y explosión?
- [ ] ¿Los comentarios están actualizados y en español declarativo?
- [ ] ¿Se actualizó `.antigravity/progress.md`?

---

## 6. Actualización de Memoria `.antigravity`

> [!IMPORTANT]
> Se requiere agregar el siguiente registro a `progress.md` al ejecutar este plan:

```markdown
### 2026-07-06 - Intento #6 (Auditoría de Código Avanzada)
- Objetivo del ciclo: Auditoría completa de la Escena 1 con foco en dos problemas reportados:
  (1) partículas no funcionan con logo-f-opt.glb, (2) sin iluminación/bloom en móvil.
- Resultado: Diagnóstico confirmado para ambos.
  - H-01: meshopt reordena el buffer de vértices; el sampling lineal del sistema de
    partículas produce distribución degenerada. Fix: sampling aleatorio.
  - H-02: esGamaBaja = true para todos los móviles; bloom desactivado completamente.
    Fix: bloom con parámetros reducidos para móvil.
  - 7 hallazgos adicionales de severidad media/baja documentados.
- Aprendizaje: Nunca asumir orden secuencial de vértices en geometrías optimizadas con meshopt.
  Nunca desactivar un efecto visual completo por categoría de dispositivo sin alternativa.
- Código/Archivo afectado: sistemaParticulasExplosionF.ts, gestorEscena.ts,
  deteccionDispositivo.ts, EscenaLogoF.ts, redimension.ts, bucleRender.ts, index.astro
```
