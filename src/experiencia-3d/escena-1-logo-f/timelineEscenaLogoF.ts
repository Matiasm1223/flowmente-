import { gsap } from 'gsap';
import type { EscenaLogoF } from './EscenaLogoF';
import { ControladorScroll } from '../nucleo/controladorScroll';

/**
 * Controla la animación basada en tiempo (Autoplay) de la Escena 1
 */
export class LineaTiempoEscenaLogoF {
  private escena: EscenaLogoF;

  constructor(escena: EscenaLogoF) {
    this.escena = escena;
  }

  public registrar(): Promise<void> {
    return new Promise((resolve) => {
      if (!this.escena.materialPremium) {
        console.error("Timeline no pudo iniciar: materialPremium no está listo.");
        resolve(); // Resuelve igual para no bloquear la aplicación indefinidamente
        return;
      }

      const tl = gsap.timeline({
        onComplete: () => {
          resolve();
        }
      });

      // Fase 1: 0s a 2s
      // El logo ya tiene velocidadRotacionBase = 0.8 por defecto. No hacemos nada, solo esperamos.
      tl.to({}, { duration: 3 });

      // Fase 2 y 3 (Paralelas): 2s a 5s
      // Aceleración exponencial (animando la variable en escena directamente)
      tl.to(this.escena, {
        velocidadExtraGSAP: 180.0,
        duration: 6,
        ease: 'power4.in'
      }, "aceleracion");

      // Brillo al máximo (animando el emissiveIntensity directamente por referencia)
      tl.to(this.escena.materialPremium, {
        emissiveIntensity: 5.5,
        duration: 5.5,
        ease: 'power4.in'
      }, "aceleracion");

      // Fase 4: Clímax (A los 5 segundos)
      tl.add(() => {
        this.escena.detonarExplosion(); // Oculta el logo estático
      });

      // Dispersión de partículas (0.5s de empuje brusco)
      tl.to(this.escena.progresoExplosion, {
        valor: 1.0,
        duration: 0.5,
        ease: 'power2.out'
      });

      // Fin. La animación concluye y las partículas se quedan esparcidas orgánicamente por su propio uTime.
      // El logo no vuelve a aparecer y no hay rotaciones post-explosión extras pedidas por especificación.
    });
  }
}
