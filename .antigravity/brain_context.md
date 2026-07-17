# ðŸ§  BRAIN CONTEXT
> Memoria estratÃ©gica y de arquitectura. LÃ­mite: 150 lÃ­neas. Mantenimiento: SOLO ACTUALIZAR.

## ðŸŽ¯ OBJETIVO GENERAL
Sitio web de Flowmente (marca tech B2B: desarrollo web + automatizaciÃ³n n8n + agentes de IA). Landing scrollytelling 3D de 5 escenas que revela una landing de conversiÃ³n tradicional. Objetivo: generar leads calificados vÃ­a diagnÃ³stico gratuito, WhatsApp como canal principal.

## ðŸ—ï¸ ARQUITECTURA ACTUAL
- nucleo/, escena-1 a escena-5: creado, sin lÃ³gica
- landing/componentes/: Encabezado, Hero (contiene H1 real), Servicios (3 pilares), SobreNosotros (video TikTok), Testimonios (mÃ©tricas pendientes), Contacto (WhatsApp pendiente nÃºmero real), Pie, BotonWhatsappFlotante â€” creado, sin lÃ³gica
- DemoAgenteIA.astro: fase 2, requiere isla React â€” no iniciar sin pedido explÃ­cito

## ðŸ› ï¸ STACK TECNOLÃ“GICO
Astro + TypeScript + Three.js + GSAP/ScrollTrigger + GLSL + UnrealBloomPass + GLTFLoader + Canvas 2D + SVG + WebP + Netlify. Descartado: React/Next (excepciÃ³n Ãºnica autorizada: isla del chatbot en fase 2).

## ðŸŽ¨ IDENTIDAD VISUAL (MARCA FLOWMENTE)
- Primario #1AB8B8 (turquesa) / Secundario #48D070 (verde) / Fondo #05060Aâ†’#0A2840 / Acento #88E8B8 / Texto #EAF1F7
- TipografÃ­a: Plus Jakarta Sans (headings) / Inter (body) / Space Grotesk (mÃ©tricas)
- Estilo: Futurismo OrgÃ¡nico-TecnolÃ³gico ("Neuro-Flow") â€” nodos, glassmorphism, glow neÃ³n

## ðŸš¦ ESTADO DEL SISTEMA (ÃšLTIMO CHECKPOINT)
- Lo que funciona: Boilerplate base de Astro con arquitectura lista y compilaciÃ³n estÃ¡tica verificada.
- Bloqueos actuales: falta nÃºmero real de WhatsApp Business; faltan mÃ©tricas reales de los 3 casos de Ã©xito mencionados (email de contacto agregado: flowmentee@gmail.com)
- PrÃ³ximo hito: ImplementaciÃ³n de la experiencia 3D y conexiÃ³n GSAP-Three en escena 1.

