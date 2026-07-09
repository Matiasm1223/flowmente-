import { gsap } from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';

gsap.registerPlugin(ScrollTrigger);

/**
 * ControladorScroll: Centraliza el registro de GSAP y ScrollTrigger.
 * Gestiona el bloqueo de scroll durante la intro mediante interceptación
 * de eventos (NO altera overflow/position del body — eso rompe ScrollTrigger).
 * 
 * Capas de bloqueo:
 *   Capa 0 (head): html.scroll-bloqueado { overflow: hidden !important } — pre-paint, sin flicker.
 *   Capa 1 (JS):   preventDefault en wheel, touchmove, keydown — intercepción activa.
 * 
 * Al desbloquear: se remueve Capa 0, se limpian listeners de Capa 1,
 * y se llama ScrollTrigger.refresh(true) para recalcular posiciones.
 */
export class ControladorScroll {
  private static inicializado = false;
  private static yaDesbloqueado = false;
  private static onScrollHandler: ((e: Event) => void) | null = null;

  // Referencias estables a los handlers para poder removerlos con removeEventListener
  private static readonly prevenirWheel = (e: WheelEvent): void => {
    e.preventDefault();
  };

  private static readonly prevenirTouchMove = (e: TouchEvent): void => {
    e.preventDefault();
  };

  private static readonly prevenirKeyDown = (e: KeyboardEvent): void => {
    const teclasBloqueadas = ['Space', 'PageUp', 'PageDown', 'End', 'Home', 'ArrowUp', 'ArrowDown'];
    if (teclasBloqueadas.includes(e.code)) {
      e.preventDefault();
    }
  };

  public static inicializar(): void {
    if (this.inicializado) return;
    ScrollTrigger.defaults({
      scrub: true,
      markers: false
    });
    this.inicializado = true;
  }
  
  public static registrarEscena(id: string, elementoTrigger: string, onUpdate: (progreso: number) => void): void {
    this.inicializar();
    ScrollTrigger.create({
      trigger: elementoTrigger,
      start: 'top top',
      end: 'bottom bottom',
      onUpdate: (self) => {
        onUpdate(self.progress);
      }
    });
  }

  /**
   * Activa la interceptación de eventos de scroll (Capa 1).
   * La Capa 0 (html.scroll-bloqueado) ya fue aplicada en el <head> de Astro.
   * NO toca overflow, position ni touchAction del body.
   */
  public static bloquearScrollParaIntro(): void {
    window.addEventListener('wheel', this.prevenirWheel, { passive: false });
    window.addEventListener('touchmove', this.prevenirTouchMove, { passive: false });
    window.addEventListener('keydown', this.prevenirKeyDown, { passive: false });
  }

  /**
   * Remueve todas las barreras de scroll, recalcula ScrollTrigger,
   * y muestra el indicador visual.
   * Idempotente: llamarla dos veces no rompe nada.
   */
  public static desbloquearScroll(): void {
    if (this.yaDesbloqueado) return;
    this.yaDesbloqueado = true;

    // 1. Remover Capa 0 (CSS del head)
    document.documentElement.classList.remove('scroll-bloqueado');

    // 2. Remover Capa 1 (Event Listeners)
    window.removeEventListener('wheel', this.prevenirWheel);
    window.removeEventListener('touchmove', this.prevenirTouchMove);
    window.removeEventListener('keydown', this.prevenirKeyDown);

    // 3. Forzar recálculo completo de ScrollTrigger
    // El refresh(true) es un hard refresh que recalcula posiciones de todos los triggers/pins.
    // Necesario porque la Capa 0 alteró overflow/height del html mientras ScrollTrigger
    // podría haber tomado medidas iniciales.
    ScrollTrigger.refresh(true);

    // 4. Mostrar indicador visual
    this.mostrarIndicadorScroll();
  }

  /** Muestra la flecha de scroll con fadeIn y la oculta al primer scroll del usuario */
  private static mostrarIndicadorScroll(): void {
    const indicador = document.getElementById('indicador-scroll');
    if (!indicador) return;

    indicador.classList.add('visible');

    this.onScrollHandler = () => {
      this.ocultarIndicadorScroll();
    };
    window.addEventListener('scroll', this.onScrollHandler, { passive: true, once: true });
  }

  /** Oculta la flecha de scroll y limpia el listener */
  private static ocultarIndicadorScroll(): void {
    const indicador = document.getElementById('indicador-scroll');
    if (indicador) {
      indicador.classList.remove('visible');
    }
    if (this.onScrollHandler) {
      window.removeEventListener('scroll', this.onScrollHandler);
      this.onScrollHandler = null;
    }
  }
}

