import { ControladorScroll } from '../nucleo/controladorScroll';
import { gsap } from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
/**
 * LineaTiempoEscena2: Timeline de la escena 2
 */
export class LineaTiempoEscena2 {
  public static inicializar(): void {
    // 1. Buscamos el riel de scroll y la tarjeta
    const rielScroll = document.querySelector('.escena-2-trigger'); 
    const tarjeta = document.getElementById('tarjeta-post-explosion');

    // Si no existen, cortamos la ejecución para evitar errores
    if (!rielScroll || !tarjeta) {
      console.warn('Faltan elementos DOM para la Escena 2');
      return;
    }
    // 2. Definimos el estado inicial de la tarjeta (invisible y pequeña)
    gsap.set(tarjeta, {
      opacity: 0,
      scale: 0,
      xPercent: 80, // Centrada inicialmente
      yPercent: -200,
    });

    // 3. Creamos la animación atada al Scroll (Scrub)
    gsap.to(tarjeta, {
      scrollTrigger: {
        trigger: rielScroll,
        start: "top top",       // Inicia cuando el tope del riel toca el tope de la pantalla
        end: "bottom bottom",   // Termina cuando el fondo del riel toca el fondo de la pantalla
        scrub: 1,               // Fricción de 1 segundo (suavidad al hacer scroll)
        markers: true           // Muestra líneas de depuración (eliminar en producción)
      },
      // Hacia dónde va la animación:
      opacity: 1,
      scale: 1,                 // Crece a su tamaño normal
      yPercent: 10,             // Se desplaza hacia la derecha (30% de su propio ancho)
      ease: "none"              // En animaciones con scrub, "none" hace que sea lineal al ratón
    });
  }
}
