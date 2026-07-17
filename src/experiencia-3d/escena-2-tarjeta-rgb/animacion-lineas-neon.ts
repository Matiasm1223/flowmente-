import { gsap } from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';

gsap.registerPlugin(ScrollTrigger);

export class AnimacionLineasNeon {
  public static inicializar(): void {
    const contenedor = document.getElementById('contenedor-lineas-neon');
    const rielScroll = document.querySelector('.escena-2-trigger');
    const svg = document.getElementById('svg-lineas-neon');

    if (!contenedor || !rielScroll || !svg) return;

    const ancho = window.innerWidth;
    const alto = window.innerHeight;

    // Configurar SVG viewBox al tamaño de pantalla (solo inicial, no en resize)
    svg.setAttribute('viewBox', `0 0 ${ancho} ${alto}`);

    const puntoConvergencia = { x: ancho, y: alto / 2 };

    // y0_i distribuidos en franja amplia: 20%, 40%, 60%, 80%, 100%
    const origenesY = [
      alto * 0.2,
      alto * 0.4,
      alto * 0.48,
      alto * 0.66,
      alto * 0.8,
    ];

    const parametrosLineas = origenesY.map((y0, index) => ({
      id: index + 1,
      delay: 0.4 + index * 0.1,
      y0: y0,
    }));

    const tl = gsap.timeline({ paused: true });

    // Parámetros de curva CÚBICA C: dos puntos de control por línea.
    // Reglas: amplitud de cy < 0.18 * alto, direcciones verticales opuestas por línea (S real), y cx1/cx2 escalonados en horizontales distintas.
    const puntosDeControl = [
      // línea 1 (y0=0.2): primer bend abajo (+), segundo bend arriba (-)
      { cx1: ancho * 0.35, cy1: alto * 0.50, cx2: ancho * 0.65, cy2: alto * 0.001 },
      // línea 2 (y0=0.4): primer bend arriba (-), segundo bend abajo (+)
      { cx1: ancho * 0.35, cy1: alto * 0.45, cx2: ancho * 0.65, cy2: alto * 0.2 },
      // línea 3 (y0=0.6): primer bend abajo (+), segundo bend arriba (-)
      { cx1: ancho * 0.27, cy1: alto * 1.0, cx2: ancho * 0.80, cy2: alto * 0.000001 },
      // línea 4 (y0=0.8): primer bend arriba (-), segundo bend abajo (+)
      { cx1: ancho * 0.35, cy1: alto * 1.0, cx2: ancho * 0.69, cy2: alto * 0.2 },
      // línea 5 (y0=0.9): primer bend arriba (-), segundo bend abajo (+)
      { cx1: ancho * 0.55, cy1: alto * 0.1, cx2: ancho * 0.65, cy2: alto * 0.78 },
    ];

    parametrosLineas.forEach((param) => {
      const pathElement = document.querySelector(`.linea-${param.id}`) as SVGPathElement;
      if (!pathElement) return;

      const x0 = 0;
      const y0 = param.y0;

      const { cx1, cy1, cx2, cy2 } = puntosDeControl[param.id - 1];

      const xf = puntoConvergencia.x;
      const yf = puntoConvergencia.y;

      const d = `M ${x0},${y0} C ${cx1},${cy1} ${cx2},${cy2} ${xf},${yf}`;

      pathElement.setAttribute('d', d);

      // Usar strokeDasharray para animar el trazado progresivamente sin plugins externos
      const length = pathElement.getTotalLength();
      
      gsap.set(pathElement, {
        strokeDasharray: length,
        strokeDashoffset: length,
        opacity: 0
      });

      // Animación concurrente del timeline (opacidad y trazado)
      tl.to(pathElement, {
        opacity: 0.8,
        duration: 0.3,
      }, param.delay);

      tl.to(pathElement, {
        strokeDashoffset: 0,
        duration: 2.5,
        ease: "power2.inOut" // Aceleración inicial y desaceleración al converger
      }, param.delay);
    });

    // ScrollTrigger propio, sin tocar la lógica de tarjeta
    ScrollTrigger.create({
      trigger: rielScroll,
      start: "top top",
      onEnter: () => tl.play(),
      // Cuando scrollea arriba de todo, se resetea por si vuelve a bajar
      onLeaveBack: () => {
        tl.pause();
        tl.progress(0);
      }
    });
  }
}
