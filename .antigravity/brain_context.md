# 🧠 BRAIN CONTEXT
> Memoria estratégica y de arquitectura. Límite: 150 líneas. Mantenimiento: SOLO ACTUALIZAR.

## 🎯 OBJETIVO GENERAL
Sitio web de Flowmente (marca tech B2B: desarrollo web + automatización n8n + agentes de IA). Landing scrollytelling 3D de 5 escenas que revela una landing de conversión tradicional. Objetivo: generar leads calificados vía diagnóstico gratuito, WhatsApp como canal principal.

## 🏗️ ARQUITECTURA ACTUAL
- nucleo/, escena-1 a escena-5: creado, sin lógica
- landing/componentes/: Encabezado, Hero (contiene H1 real), Servicios (3 pilares), SobreNosotros (video TikTok), Testimonios (métricas pendientes), Contacto (WhatsApp pendiente número real), Pie, BotonWhatsappFlotante — creado, sin lógica
- DemoAgenteIA.astro: fase 2, requiere isla React — no iniciar sin pedido explícito

## 🛠️ STACK TECNOLÓGICO
Astro + TypeScript + Three.js + GSAP/ScrollTrigger + GLSL + UnrealBloomPass + GLTFLoader + Canvas 2D + SVG + WebP + Netlify. Descartado: React/Next (excepción única autorizada: isla del chatbot en fase 2).

## 🎨 IDENTIDAD VISUAL (MARCA FLOWMENTE)
- Primario #1AB8B8 (turquesa) / Secundario #48D070 (verde) / Fondo #05060A→#0A2840 / Acento #88E8B8 / Texto #EAF1F7
- Tipografía: Plus Jakarta Sans (headings) / Inter (body) / Space Grotesk (métricas)
- Estilo: Futurismo Orgánico-Tecnológico ("Neuro-Flow") — nodos, glassmorphism, glow neón

## 🚦 ESTADO DEL SISTEMA (ÚLTIMO CHECKPOINT)
- Lo que funciona: Boilerplate base de Astro con arquitectura lista y compilación estática verificada.
- Bloqueos actuales: falta número real de WhatsApp Business; faltan métricas reales de los 3 casos de éxito mencionados (email de contacto agregado: flowmentee@gmail.com)
- Próximo hito: Implementación de la experiencia 3D y conexión GSAP-Three en escena 1.
