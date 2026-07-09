# 🚨 RULES
> Reglas absolutas e inmutables. Nunca se relajan las existentes.

## 🤖 KILL SWITCH (Anti-loop)
- Tras 3 intentos fallidos consecutivos de implementar una característica o corregir un error:
  1. Detener ejecución de código (STOP).
  2. Documentar en progress.md el callejón sin salida.
  3. Solicitar intervención humana explícita antes de continuar.

## 🎨 REGLAS DE MARCA (FLOWMENTE)
1. Usar exclusivamente los hex de compartido/constantes.ts (#1AB8B8, #48D070, #0A2840, #05060A, #88E8B8, #EAF1F7) — nunca inventar colores nuevos.
2. #48D070 y #1AB8B8 solo en texto grande/iconografía; body copy extenso siempre en #EAF1F7.
3. No usar elementos de urgencia o escasez artificial (contadores de cupos, temporizadores falsos) en ninguna sección.
4. La excepción a "no usar React/Next" aplica únicamente a DemoAgenteIA.astro (fase 2, isla client:load) — ningún otro componente puede justificarla.
5. Todo dato marcado [INFERIDO] en el análisis de marca debe tratarse como supuesto de trabajo, no como hecho confirmado, hasta validación explícita del usuario.

## 📝 REGLAS DE CÓDIGO
1. Todos los nombres de funciones, clases, archivos, componentes y variables deben estar en español.
2. Los nombres deben ser súper declarativos y fáciles de entender solo con leerlos, aunque sean largos.
3. Se deben agregar comentarios declarativos y claros que expliquen qué hace o modifica cada sección importante del código.
