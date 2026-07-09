# Informe de Auditoría Técnica — Flowmente 3D
## Sesión actual: Hitos 1–6 (Núcleo + Escena 1 con Explosión de Partículas)

**Fecha de auditoría:** 2026-07-02  
**Alcance:** Solo la sesión actual (commits realizados en esta conversación).  
**Modo de auditoría:** Solo lectura — ninguna línea de código fue modificada para este informe.  
**Fuente de verdad del proyecto:** `.antigravity/brain_context.md`, `.antigravity/rules.md`, `.antigravity/progress.md`

---

## Índice

1. [Contexto y fuente de verdad (.antigravity)](#1-contexto-y-fuente-de-verdad-antigravity)
2. [Alcance y archivos afectados](#2-alcance-y-archivos-afectados)
3. [Análisis individual por módulo](#3-análisis-individual-por-módulo)
   - [3.1 — `nucleo/gestorEscena.ts`](#31--nucleo-gestoreescenats)
   - [3.2 — `nucleo/bucleRender.ts`](#32--nucleo-buclerenderts)
   - [3.3 — `nucleo/controladorScroll.ts`](#33--nucleo-controladorscrollts)
   - [3.4 — `nucleo/gestorRecursos.ts`](#34--nucleo-gestorrecursosts)
   - [3.5 — `nucleo/deteccionDispositivo.ts`](#35--nucleo-detecciondispositivots)
   - [3.6 — `nucleo/tipos.ts`](#36--nucleo-tiposts)
   - [3.7 — `nucleo/redimension.ts`](#37--nucleo-redimensionts)
   - [3.8 — `escena-1-logo-f/EscenaLogoF.ts`](#38--escena-1-logo-fescenalogoFts)
   - [3.9 — `escena-1-logo-f/sistemaParticulasExplosionF.ts`](#39--escena-1-logo-fsistemaparticulasexplosionFts)
   - [3.10 — `escena-1-logo-f/timelineEscenaLogoF.ts`](#310--escena-1-logo-ftimelineescenalogofts)
   - [3.11 — `shaders/particulas.vert.glsl` y `particulas.frag.glsl`](#311--shadersparticulasvertglsl-y-particulasfragglsl)
   - [3.12 — `pages/index.astro`](#312--pagesindexastro)
   - [3.13 — `optimize-model.mjs`](#313--optimize-modelmjs)
4. [Análisis transversal](#4-análisis-transversal)
   - [4.1 — Reglas de naming (.antigravity/rules.md)](#41--reglas-de-naming-antigravityrulesmd)
   - [4.2 — Warnings de TypeScript (astro check)](#42--warnings-de-typescript-astro-check)
   - [4.3 — Cobertura de tests](#43--cobertura-de-tests)
   - [4.4 — Código muerto o aislado](#44--código-muerto-o-aislado)
5. [Resumen ejecutivo y recomendaciones](#5-resumen-ejecutivo-y-recomendaciones)

---

## 1. Contexto y fuente de verdad (.antigravity)

El proyecto Flowmente es una landing page de conversión B2B para una agencia de desarrollo web, automatización n8n e IA, dirigida a pymes. La landing utiliza una experiencia de scrollytelling 3D de 5 escenas que antecede y revela una landing de conversión tradicional.

Las reglas absolutas del proyecto, definidas en `.antigravity/rules.md`, son:

| ID | Regla |
|----|-------|
| R1 | Usar exclusivamente los colores de `compartido/constantes.ts` — nunca inventar colores nuevos |
| R2 | `#48D070` y `#1AB8B8` solo en texto grande/iconografía |
| R3 | No usar urgencia o escasez artificial |
| R4 | React/Next solo en `DemoAgenteIA.astro` (fase 2) |
| R5 | Datos `[INFERIDO]` son supuestos de trabajo, no hechos confirmados |
| R6 | **Todos los nombres en español** |
| R7 | Nombres super declarativos, aunque sean largos |
| R8 | Comentarios declarativos en cada sección importante |

El estado documentado al inicio de la sesión auditada (`.antigravity/brain_context.md`, checkpoint) era:
> *"Lo que funciona: Boilerplate base de Astro con arquitectura lista y compilación estática verificada. Próximo hito: Implementación de la experiencia 3D y conexión GSAP-Three en escena 1."*

---

## 2. Alcance y archivos afectados

### Archivos nuevos creados en esta sesión

| Archivo | Propósito |
|---------|-----------|
| `src/experiencia-3d/nucleo/gestorEscena.ts` | Renderer WebGL centralizado + IBL + Bloom |
| `src/experiencia-3d/nucleo/bucleRender.ts` | Loop `requestAnimationFrame` + delta time |
| `src/experiencia-3d/nucleo/controladorScroll.ts` | Integración GSAP ScrollTrigger |
| `src/experiencia-3d/nucleo/gestorRecursos.ts` | GLTFLoader + caché de modelos |
| `src/experiencia-3d/nucleo/deteccionDispositivo.ts` | Detección mobile/gama-baja |
| `src/experiencia-3d/nucleo/tipos.ts` | Interface `IEscena` |
| `src/experiencia-3d/nucleo/redimension.ts` | Handler de `window.resize` |
| `src/experiencia-3d/escena-1-logo-f/EscenaLogoF.ts` | Controlador de la Escena 1 |
| `src/experiencia-3d/escena-1-logo-f/sistemaParticulasExplosionF.ts` | Explosión de partículas |
| `src/experiencia-3d/escena-1-logo-f/timelineEscenaLogoF.ts` | Timeline GSAP de la Escena 1 |
| `src/experiencia-3d/escena-1-logo-f/shaders/particulas.vert.glsl` | Vertex shader de partículas |
| `src/experiencia-3d/escena-1-logo-f/shaders/particulas.frag.glsl` | Fragment shader de partículas |
| `optimize-model.mjs` | Script de optimización offline del modelo GLB |

### Archivos modificados en esta sesión

| Archivo | Naturaleza del cambio |
|---------|-----------------------|
| `src/pages/index.astro` | Canvas 3D + script de inicialización |

### Archivos sin cambios (esqueleto previo, sin lógica)

`fondoTransicion.ts`, `overlayTextoA1.ts`, archivos de `escena-2` a `escena-5` — estos son stubs del Intento #3 y no forman parte de esta auditoría.

---

## 3. Análisis individual por módulo

---

### 3.1 — `nucleo/gestorEscena.ts`

**¿Qué se modificó?**  
Clase creada desde cero (el archivo existía como stub vacío). Implementa la inicialización completa del contexto WebGL compartido.

**¿Por qué se modificó?**  
Corresponde al Hito 1 del plan: establecer el renderer único, el IBL (`RoomEnvironment`) y el post-procesado (`UnrealBloomPass`) como prerequisito de todas las escenas. El `brain_context.md` menciona explícitamente `UnrealBloomPass + GLTFLoader + Canvas 2D + WebP` como parte del stack.

**¿Cómo se modificó?**  
La clase recibe el `<canvas>` como parámetro. El flujo de inicialización es:

```typescript
// 1. Detectar dispositivo (gama baja vs alta)
this.rendererInfo = { esGamaBaja: obtenerDispositivo().esGamaBaja };

// 2. Crear renderer con antialias condicional
new THREE.WebGLRenderer({ antialias: !this.rendererInfo.esGamaBaja, ... })

// 3. Tono filmico + IBL (RoomEnvironment)
this.escena.environment = pmremGenerator.fromScene(new RoomEnvironment()).texture;

// 4. Bloom solo en dispositivos de alta gama
if (!this.rendererInfo.esGamaBaja) {
  const bloomPass = new UnrealBloomPass(resolution, 1.5, 0.4, 0.85);
  ...
}
```

**Impacto:** Es el objeto raíz de toda la experiencia. Toda escena depende de su instancia para acceder a `THREE.Scene`, `THREE.PerspectiveCamera` y el renderer.

**Riesgos potenciales:**

| Riesgo | Severidad |
|--------|-----------|
| `pmremGenerator.fromScene()` genera texturas en la GPU y no se llama `pmremGenerator.dispose()` después — **leak de GPU confirmado** | 🔴 Crítico |
| `RoomEnvironment` crea su propia escena interna que tampoco se libera | 🔴 Crítico |
| El `EffectComposer` no se destruye si se llama a `dispose()` globalmente en el futuro | 🟡 Moderado |
| El método `redimensionar()` existe en la clase pero `Redimension.ts` no lo usa (llama solo a `obtenerCamara()`) | 🟡 Moderado |

**Nivel de criticidad:** 🟠 Alto (la funcionalidad es correcta; los leaks son técnicamente inactivos mientras no se destruya la escena, pero en SPA o con múltiples instanciaciones serían críticos).

**Coherencia con .antigravity:** ✅ Correcta. El stack declarado incluye Three.js, UnrealBloomPass y detección de dispositivo.

---

### 3.2 — `nucleo/bucleRender.ts`

**¿Qué se modificó?**  
Clase implementada desde stub. Centraliza `requestAnimationFrame` y la distribución de `deltaTime` a todas las escenas registradas.

**¿Por qué se modificó?**  
Hito 2: loop de render centralizado, requisito antes de montar cualquier escena.

**¿Cómo se modificó?**

```typescript
private tick = (): void => {
  const deltaTime = this.reloj.getDelta();
  for (const escena of this.escenas) {
    escena.actualizar(deltaTime);
  }
  this.gestorEscena.renderizar();
  requestAnimationFrame(this.tick);
}
```

**Riesgos potenciales:**

| Riesgo | Severidad |
|--------|-----------|
| `import { ControladorScroll }` en línea 4 — importado pero nunca usado (warning ts(6133)) | 🟡 Moderado |
| `THREE.Clock` está marcado como **deprecado** en Three.js r185 (warning ts(6385)) | 🟡 Moderado |
| No hay cancelación de `requestAnimationFrame` en `detener()` — el loop sigue corriendo a nivel de motor aunque `animando` sea `false` | 🟠 Alto |

**Nivel de criticidad:** 🟡 Moderado — funciona correctamente pero introduce un memory leak menor (RAF sin cancelar) y deuda con la API deprecada de Clock.

**Coherencia con .antigravity:** ✅ Correcta en intención, con la observación del import sin usar.

---

### 3.3 — `nucleo/controladorScroll.ts`

**¿Qué se modificó?**  
Implementación desde stub. Centraliza el registro de GSAP + ScrollTrigger.

**¿Cómo se modificó?**

```typescript
public static registrarEscena(id: string, elementoTrigger: string, onUpdate: (progreso: number) => void): void {
  ScrollTrigger.create({
    trigger: elementoTrigger,
    start: 'top top', end: 'bottom bottom',
    onUpdate: (self) => { onUpdate(self.progress); }
  });
}
```

**Riesgos potenciales:**

| Riesgo | Severidad |
|--------|-----------|
| El parámetro `id` (string) se declara pero nunca se usa — warning ts(6133) | 🟢 Menor |
| `scrub: true` en los defaults sin valor numérico — el scrub es instantáneo; un valor como `scrub: 1` daría suavizado | 🟢 Menor |
| Los 5 archivos de escenas 2–5 llaman a `registrarEscena` con un callback `(progreso) => {}` vacío, generando 5 warnings adicionales | 🟢 Menor |

**Nivel de criticidad:** 🟢 Menor.

**Coherencia con .antigravity:** ✅ Correcta. GSAP/ScrollTrigger está en el stack declarado.

---

### 3.4 — `nucleo/gestorRecursos.ts`

**¿Qué se modificó?**  
Implementación desde stub. Carga y cachea modelos GLTF.

**¿Cómo se modificó?**  
Usa `GLTFLoader` con `MeshoptDecoder` para decodificar la malla simplificada por el script `optimize-model.mjs`. Implementa un caché estático con `Map<string, THREE.Group>` y clona el modelo en cada llamada para permitir múltiples instancias.

**Riesgos potenciales:**

| Riesgo | Severidad |
|--------|-----------|
| `precargarFotogramas()` — stub que retorna array vacío; los parámetros `rutaBase` y `cantidad` producen warnings ts(6133) | 🟢 Menor |
| Los materiales del modelo cacheado son compartidos entre todos los clones — `clone(true)` clona la jerarquía de objetos pero **no los materiales** en Three.js r185 por defecto | 🔴 Crítico |

> **Nota crítica sobre el clone:** En Three.js, `Group.clone(true)` recursivo clona la geometría pero los materiales son referencias compartidas. Si `EscenaLogoF` reasigna `mesh.material = new THREE.MeshStandardMaterial(...)` en `traverse()`, lo hace sobre el clon, no sobre el original en caché — esto es **correcto en este contexto específico** porque la reasignación ocurre post-clone. Sin embargo, si en el futuro se carga la misma ruta dos veces sin reasignar el material, ambas instancias compartirán el mismo objeto material y cualquier cambio a uno afectará al otro.

**Nivel de criticidad:** 🟡 Moderado — correcto para el uso actual, riesgo latente para escenas futuras.

**Coherencia con .antigravity:** ✅ Correcta. `GLTFLoader` + `MeshoptDecoder` están en el stack.

---

### 3.5 — `nucleo/deteccionDispositivo.ts`

**¿Qué se modificó?**  
Implementación desde stub. Detecta capacidades del dispositivo para ajustar fidelidad 3D.

**¿Cómo se modificó?**  
Usa tres heurísticas: user-agent para mobile, `window.innerWidth <= 768`, y `navigator.hardwareConcurrency`.

```typescript
const esGamaBaja = esMovil || hilos <= 4;
```

**Riesgos potenciales:**

| Riesgo | Severidad |
|--------|-----------|
| `navigator.hardwareConcurrency <= 4` clasifica como gama baja cualquier dispositivo con 4 hilos, incluyendo Mac M1/M2 modernos que reportan 8–12 hilos correctamente pero también máquinas de escritorio de 4 núcleos que son perfectamente capaces | 🟡 Moderado |
| La lógica `esGamaBaja = esMovil || hilos <= 4` desactiva el Bloom en **todo** mobile, incluyendo iPhone 15 Pro — esto puede ser intencional pero debería estar documentado como decisión de diseño | 🟡 Moderado |
| El guard de SSR es correcto: retorna `true` en todos los campos, lo cual falla-seguro hacia modo de baja calidad | ✅ Correcto |

**Nivel de criticidad:** 🟡 Moderado.

**Coherencia con .antigravity:** ✅ Alineado. `brain_context.md` menciona el fallback para gama baja explícitamente.

---

### 3.6 — `nucleo/tipos.ts`

**¿Qué se modificó?**  
Archivo nuevo. Define la interface `IEscena` como contrato de todas las escenas.

**Riesgos potenciales:**

| Riesgo | Severidad |
|--------|-----------|
| `import * as THREE from 'three'` en línea 1 — importado pero nunca usado en el archivo (la interface usa un import dinámico en línea 5) — warning ts(6133) | 🟢 Menor |
| El método `destruir?()` es opcional en la interface, pero ninguna escena lo implementa actualmente, generando riesgo de leaks al desmontar escenas | 🟠 Alto (deuda) |

**Nivel de criticidad:** 🟢 Menor (el import sobrante es el único problema activo).

**Coherencia con .antigravity:** ✅ Correcta. El nombre `IEscena` respeta la convención española.

---

### 3.7 — `nucleo/redimension.ts`

**¿Qué se modificó?**  
Clase creada desde stub. Suscribe al evento `resize` de la ventana.

**Análisis crítico:**

```typescript
private onResize = (): void => {
  const camara = this.gestor.obtenerCamara();
  camara.aspect = window.innerWidth / window.innerHeight;
  camara.updateProjectionMatrix();
  // this.gestor.obtenerRenderer().setSize(window.innerWidth, window.innerHeight); ← COMENTADO
}
```

> **Hallazgo crítico:** La línea `setSize()` y `composer.setSize()` está **comentada**. `GestorEscena` tiene el método `redimensionar(width, height)` que hace exactamente esto de forma completa, pero `Redimension` no lo llama. El resultado es que al redimensionar la ventana, la cámara actualiza su aspect ratio pero el renderer y el EffectComposer mantienen la resolución original, produciendo **distorsión visual** en todos los dispositivos donde el usuario redimensiona la ventana.

| Riesgo | Severidad |
|--------|-----------|
| El renderer no se redimensiona al cambiar el tamaño de ventana — distorsión visual confirmada | 🔴 Crítico |
| `GestorEscena.redimensionar()` existe pero no se invoca desde ningún punto del código | 🔴 Crítico |
| La instancia `redimension` en `index.astro` se crea pero nunca se usa ni se destruye, creando un listener huérfano | 🟡 Moderado |

**Nivel de criticidad:** 🔴 Crítico. La funcionalidad de resize está rota.

**Coherencia con .antigravity:** ❌ Contradice la expectativa funcional (el resize debería funcionar correctamente).

---

### 3.8 — `escena-1-logo-f/EscenaLogoF.ts`

**¿Qué se modificó?**  
Controlador principal de la Escena 1. Implementado desde stub con lógica completa.

**¿Cómo se modificó?**  
El flujo de `inicializar()` es:

1. Agrega el `grupo` a la escena Three.js
2. Carga `logo-f-opt.glb` vía `GestorRecursos`
3. Itera con `traverse()` sobre cada mesh del modelo
4. Reasigna el material como `MeshStandardMaterial` con `metalness: 1.0, roughness: 1.0`
5. En el primer mesh, inicializa `SistemaParticulasExplosionF`
6. Escala el modelo y las partículas a `(5, 5, 5)`
7. Intenta centrar el pivote
8. Agrega luces y registra la timeline GSAP

**Hallazgo crítico — Lógica de centrado del pivote:**

```typescript
const box = new THREE.Box3().setFromObject(this.modeloF);
const center = box.getCenter(new THREE.Vector3());
this.modeloF.position.x += (this.modeloF.position.x - center.x);
```

> **La matemática es incorrecta.** La posición inicial del modelo cargado desde GLTF suele ser `(0,0,0)`. Si `center.x = 2`, el código hace `position.x = 0 + (0 - 2) = -2`, que mueve el modelo a `-2` pero no centra el pivote en el origen del `Group`. La forma correcta sería `position.x = -center.x`. Esto puede posicionar el logo incorrectamente en pantalla.

**Hallazgo adicional — Escala aplicada antes del centrado:**  
El `scale.set(5, 5, 5)` se aplica **antes** del cálculo del `Box3`. Esto significa que el `Box3` calcula la caja del modelo ya escalado, lo cual es correcto. Sin embargo, el `SistemaParticulasExplosionF` se inicializa **con las posiciones sin escalar** (del mesh original), y luego se le aplica un `scale.set(5, 5, 5)` separado. Si el mesh tiene posiciones en un espacio de coordenadas diferente al del grupo, habrá un desajuste visual entre las partículas y el modelo.

**Riesgos potenciales:**

| Riesgo | Severidad |
|--------|-----------|
| Lógica de centrado de pivote incorrecta matemáticamente | 🔴 Crítico |
| Las partículas pueden no coincidir visualmente con el modelo al explotar | 🟠 Alto |
| `deltaTime` se declara como parámetro en `actualizar()` pero nunca se usa — warning ts(6133) | 🟢 Menor |
| `performance.now()` para el movimiento sinusoidal no es determinista entre frames — correcto para animación continua, pero introduce una dependencia de tiempo de reloj externo al `deltaTime` | 🟡 Moderado |

**Nivel de criticidad:** 🔴 Crítico (pivot), 🟠 Alto (partículas).

**Coherencia con .antigravity:** ✅ El material metálico y la explosión de partículas están especificados en el plan. El color del emissive (`0x000000`) está correcto — el Hito 8 planifica ajustarlo para el Bloom.

---

### 3.9 — `escena-1-logo-f/sistemaParticulasExplosionF.ts`

**¿Qué se modificó?**  
Clase nueva. Genera el sistema de partículas de explosión del logo.

**¿Cómo se modificó?**  
Samplea hasta 30.000 vértices del mesh con un step de submuestreo. Genera direcciones de dispersión usando la secuencia de Fibonacci esférica (distribución uniforme en esfera). Configura `BufferGeometry` con tres atributos: `position`, `aRandomDir`, `aRandomSize`.

**Coherencia con .antigravity (regla R1 — colores):**  
```typescript
const color = new THREE.Color(paletaColores.primario); // "#1AB8B8"
```
✅ **Usa el color primario de `constantes.ts` correctamente.** Sin embargo, el comentario dice `"Ej: #48D070"` lo cual es **incorrecto** — `paletaColores.primario` es `#1AB8B8` (turquesa), no `#48D070` (verde secundario). El comentario erróneo puede generar confusión en el futuro.

**Riesgos potenciales:**

| Riesgo | Severidad |
|--------|-----------|
| Comentario incorrecto: `paletaColores.primario` es `#1AB8B8`, no `#48D070` | 🟢 Menor (doc) |
| El step de submuestreo puede producir un `particulasReales` menor al esperado si `vertexCount` es pequeño, resultando en arrays sobredimensionados | 🟢 Menor |
| Las transformaciones en `inicializarDesdeModelo()` copian la posición del **padre del mesh**, no del mesh mismo — si el mesh no tiene padre, usa su propia posición. Esto puede no coincidir con la posición efectiva del mesh en el espacio del grupo | 🟡 Moderado |

**Nivel de criticidad:** 🟡 Moderado.

**Coherencia con .antigravity:** ✅ Respeta R1 (colores de constantes). El nombre de la clase `SistemaParticulasExplosionF` respeta R6 (español) y R7 (declarativo).

---

### 3.10 — `escena-1-logo-f/timelineEscenaLogoF.ts`

**¿Qué se modificó?**  
Implementación desde stub. Registra el ScrollTrigger para la Escena 1.

**¿Cómo se modificó?**

```typescript
ControladorScroll.registrarEscena('escena-1-logo-f', '#seccion-hero', (progreso) => {
  this.escena.progresoScroll = progreso;
});
```

**Riesgos potenciales:**

| Riesgo | Severidad |
|--------|-----------|
| El trigger `#seccion-hero` asume que existe un elemento con ese `id` en el DOM. Si `Landing.astro` o `Hero.astro` no tiene ese id, el ScrollTrigger no se activará silenciosamente (sin error) | 🔴 Crítico (integración) |
| No se verifica si GSAP está correctamente inicializado antes de llamar a `registrarEscena` | 🟡 Moderado |

**Nivel de criticidad:** 🔴 Crítico (si el elemento no existe, toda la animación scroll queda muerta sin error visible).

**Coherencia con .antigravity:** ✅ Correcto en intención. El nombre de clase `LineaTiempoEscenaLogoF` respeta R6 y R7.

---

### 3.11 — `shaders/particulas.vert.glsl` y `particulas.frag.glsl`

**¿Qué se modificó?**  
Shaders GLSL escritos desde cero para el sistema de partículas.

**Vertex shader — lógica:**

```glsl
float expProgress = 1.0 - pow(1.0 - uProgress, 3.0); // ease-out cúbico
vec3 explodedPosition = position + aRandomDir * expProgress * 20.0;
gl_PointSize = (10.0 * aRandomSize) / -mvPosition.z; // atenuación por distancia
vAlpha = 1.0 - uProgress; // fade-out
```

**Fragment shader — lógica:**

```glsl
float strength = 0.05 / distanceToCenter - 0.1; // función de glow
if (strength < 0.0) discard;
gl_FragColor = vec4(uColor, strength * vAlpha);
```

**Análisis de la convención de naming GLSL vs. Regla R6 (.antigravity):**  
Las reglas dicen que **todos los nombres** deben estar en español. Sin embargo, los shaders usan convención GLSL estándar de la industria:

| Variable GLSL | Convención estándar | ¿Viola R6? |
|---------------|---------------------|------------|
| `uProgress` | Prefijo `u` = uniform | ✅ Tensión con R6 |
| `aRandomDir` | Prefijo `a` = attribute | ✅ Tensión con R6 |
| `aRandomSize` | Prefijo `a` = attribute | ✅ Tensión con R6 |
| `vAlpha` | Prefijo `v` = varying | ✅ Tensión con R6 |
| `uColor` | Prefijo `u` = uniform | ✅ Tensión con R6 |

> **Fallo confirmado contra R6.** Los shaders violan la regla de naming en español. La convención `u/a/v` prefijada es un estándar de la industria GLSL que aporta legibilidad técnica, pero contradice las reglas del proyecto. La alternativa sería `uProgreso`, `aDireccionAleatoria`, `vAlfa`, `uColor` → `uColorParticulas`, que seguiría siendo GLSL válido aunque poco convencional.

**Riesgos potenciales:**

| Riesgo | Severidad |
|--------|-----------|
| `gl_PointSize` sin clampeo — valores extremadamente grandes o negativos al acercarse `mvPosition.z` a 0 pueden producir partículas de tamaño infinito | 🔴 Crítico (WebGL) |
| La función de glow `0.05 / distanceToCenter - 0.1` produce `+Infinity` cuando `distanceToCenter == 0` (centro exacto del punto) — el `discard` no protege este caso porque `+Infinity >= 0` | 🟡 Moderado |
| Naming en inglés viola R6 | 🟡 Moderado (governance) |

**Nivel de criticidad:** 🔴 Crítico (PointSize sin clampeo), 🟡 Moderado (naming).

---

### 3.12 — `pages/index.astro`

**¿Qué se modificó?**  
Agregado el canvas `#lienzo-3d`, los estilos CSS para fijarlo al fondo, y el script de inicialización de la experiencia 3D.

**¿Cómo se modificó?**

```astro
<canvas id="lienzo-3d" aria-hidden="true"></canvas>
<script>
  ...
  await escenaLogo.inicializar(gestorEscena);
  bucle.registrarEscena(escenaLogo);
</script>
```

**Riesgos potenciales:**

| Riesgo | Severidad |
|--------|-----------|
| El script usa `await` en el top level — esto requiere que el módulo sea `async`, lo cual Astro maneja correctamente en scripts de módulo. Pero si falla el `await`, el error queda sin manejar | 🟡 Moderado |
| `bucle.iniciar()` se llama **antes** de `await escenaLogo.inicializar()` — el loop de render inicia con 0 escenas registradas, lo que es técnicamente correcto pero genera frames vacíos durante la carga del modelo | 🟢 Menor |
| La variable `redimension` se declara pero el Astro linter genera warning porque la clase `Redimension` no llama al método `GestorEscena.redimensionar()` — el resize está roto (ver 3.7) | 🔴 Crítico |
| Schema markup (JSON-LD) con `set:html` genera un warning de Astro porque el script no puede ser procesado como módulo TypeScript | 🟢 Menor (cosmético) |

**Nivel de criticidad:** 🔴 Crítico (resize roto por omisión en `Redimension`).

**Coherencia con .antigravity:** ✅ El canvas con `aria-hidden` y `z-index: -1` es correcto. Las fuentes Google Fonts coinciden con las declaradas en `constantes.ts`.

---

### 3.13 — `optimize-model.mjs`

**¿Qué se modificó?**  
Script offline nuevo para optimizar el modelo 3D.

**¿Cómo se modificó?**  
Usa `@gltf-transform` para aplicar: `dedup()`, `prune()`, `textureResize({ size: [1024, 1024] })`, y `simplify({ ratio: 0.1 })`.

**Resultado documentado:** 94 MB → 17.43 MB (-81%).

**Riesgos potenciales:**

| Riesgo | Severidad |
|--------|-----------|
| `ratio: 0.1` simplifica al 10% de los polígonos — agresivo para un logo con detalles geométricos finos | 🟡 Moderado |
| El script escribe en `public/modelos-3d/logo-f-opt.glb` pero no existe ningún `.gitignore` que excluya los archivos `.glb` originales de gran tamaño | 🟡 Moderado |
| El nombre del script está en inglés (`optimize-model`) — viola R6 | 🟢 Menor |

**Nivel de criticidad:** 🟢 Menor.

**Coherencia con .antigravity:** ✅ El modelo optimizado es un prerequisito documentado para el stack (reducir la carga inicial).

---

## 4. Análisis transversal

### 4.1 — Reglas de naming (.antigravity/rules.md)

| Regla | Estado | Detalle |
|-------|--------|---------|
| R6: Todo en español | ⚠️ Parcialmente violada | Los shaders GLSL usan naming inglés estándar (`uProgress`, `aRandomDir`, `vAlpha`). El script de optimización se llama `optimize-model.mjs`. Los comentarios dentro del código mayoritariamente en español. |
| R7: Nombres declarativos | ✅ Cumplida | `SistemaParticulasExplosionF`, `LineaTiempoEscenaLogoF`, `GestorRecursos` — todos descriptivos. |
| R8: Comentarios declarativos | ✅ Mayoritariamente cumplida | Hay comentarios en todos los archivos del núcleo. Algunos son muy breves (ej: `fondoTransicion.ts`). |

### 4.2 — Warnings de TypeScript (astro check)

El `astro check` final arrojó **1 error** (ya corregido) y **25 hints/warnings**. Clasificados:

| Tipo | Cantidad | Archivos |
|------|----------|----------|
| Parámetros declarados y no usados (ts6133) | 15 | Todos los stubs de escenas 2–5, `bucleRender.ts`, `gestorRecursos.ts`, `EscenaLogoF.ts`, `controladorScroll.ts` |
| `THREE.Clock` deprecado (ts6385) | 2 | `bucleRender.ts` |
| Import sin usar (ts6133) | 3 | `bucleRender.ts` (ControladorScroll), `tipos.ts` (THREE) |
| Warning de Astro (inline script) | 1 | `index.astro` (JSON-LD) |
| Error crítico (ya corregido) | 1 | `index.astro` (`inicializarRedimension` no existía) |

### 4.3 — Cobertura de tests

**No existe ningún test en el proyecto.** No hay carpeta `__tests__`, ni archivos `.spec.ts`, ni `vitest.config.ts`, ni referencias a testing en `package.json`. Esto no viola ninguna regla de `.antigravity` (que no menciona testing explícitamente), pero es deuda técnica significativa para:
- La lógica de detección de dispositivo (que varía por entorno)
- El centrado del pivote (matemática incorrecta que un test hubiera detectado)
- La inicialización del BufferGeometry de partículas

### 4.4 — Código muerto o aislado

| Código | Ubicación | Estado |
|--------|-----------|--------|
| `GestorEscena.redimensionar()` | `gestorEscena.ts:65` | Implementado correctamente pero nunca llamado |
| `GestorRecursos.precargarFotogramas()` | `gestorRecursos.ts:41` | Stub vacío, parámetros producen warnings |
| `fondoTransicion.ts` | `escena-1-logo-f/` | Stub sin lógica, no importado por `EscenaLogoF` |
| `overlayTextoA1.ts` | `escena-1-logo-f/` | Stub sin lógica, no importado por `EscenaLogoF` |
| `IEscena.destruir?()` | `nucleo/tipos.ts` | Declarado como opcional, nunca implementado en ninguna escena |

---

## 5. Resumen ejecutivo y recomendaciones

### Hallazgos críticos (🔴)

| # | Hallazgo | Archivo | Impacto |
|---|----------|---------|---------|
| C1 | `Redimension.ts` no llama a `GestorEscena.redimensionar()` — el renderer y composer no se redimensionan | `redimension.ts:17` | Distorsión visual en redimensionado de ventana |
| C2 | `gl_PointSize` sin clampeo en vertex shader — puede producir partículas de tamaño infinito | `particulas.vert.glsl:21` | Crash o artefactos visuales en GPU |
| C3 | Lógica de centrado de pivote matemáticamente incorrecta | `EscenaLogoF.ts:67-69` | Logo posicionado incorrectamente en pantalla |
| C4 | `#seccion-hero` — trigger de ScrollTrigger asume un elemento DOM que puede no existir | `timelineEscenaLogoF.ts:18` | Toda la animación scroll queda inactiva sin error visible |
| C5 | `PMREMGenerator` y `RoomEnvironment` no se liberan con `dispose()` | `gestorEscena.ts:40-42` | Leak de memoria GPU (activo en desarrollo, crítico si se instancia múltiples veces) |

### Hallazgos moderados (🟠/🟡)

| # | Hallazgo | Recomendación |
|---|----------|---------------|
| M1 | `THREE.Clock` deprecado | Migrar a `Date.now()` o la nueva API de Three.js r185 |
| M2 | `requestAnimationFrame` sin `id` en `BucleRender.detener()` | Guardar el ID del RAF y llamar `cancelAnimationFrame()` |
| M3 | Heurística de gama baja demasiado agresiva (hilos ≤ 4) | Agregar benchmark de GPU o usar `GPU.tier` |
| M4 | Materiales compartidos en clones de caché | Agregar `material.clone()` explícito en `GestorRecursos` |
| M5 | Comentario incorrecto `// Ej: #48D070` en `sistemaParticulasExplosionF.ts` | Corregir a `// #1AB8B8 turquesa` |

### Violaciones a .antigravity

| Regla | Violación | Archivo |
|-------|-----------|---------|
| R6 (nombres en español) | Variables GLSL en inglés: `uProgress`, `aRandomDir`, `vAlpha`, `uColor` | `particulas.vert.glsl`, `particulas.frag.glsl` |
| R6 (nombres en español) | Nombre del script de optimización en inglés: `optimize-model.mjs` | Raíz del proyecto |

### Decisión recomendada sobre los shaders (R6)

Dado que la convención `u/a/v` es un contrato de la GPU (el driver GLSL no distingue entre nombres en inglés o español), la violación es **formal pero no técnicamente dañina**. La recomendación es **documentar una excepción explícita en `.antigravity/rules.md`** para archivos `.glsl`, indicando que los prefijos de tipo (`u`, `a`, `v`) son convención de la industria y están exentos de la regla R6.

### Estado final del sistema

```
✅ Funcional: Renderer, Bloom condicional, IBL, carga de modelo, materiales metálicos,
              sistema de partículas, integración GSAP, canvas en index.astro
🔴 Roto:      Resize de ventana, centrado del pivote del logo
⚠️ Pendiente: Verificar existencia de #seccion-hero, dispose() de PMREMGenerator,
              clampeo de gl_PointSize
📋 Deuda:     THREE.Clock deprecado, 15 warnings de parámetros sin usar,
              ausencia total de tests
```
