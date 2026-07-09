import type { GestorEscena } from './gestorEscena';

/**
 * Redimension: Maneja el resize de la ventana
 */
export class Redimension {
  private onOrientationChange = (): void => {
    // Delay para permitir que el navegador actualice window.innerWidth/Height
    setTimeout(this.onResize, 150);
  };

  constructor(private gestor: GestorEscena) {
    window.addEventListener('resize', this.onResize);
    window.addEventListener('orientationchange', this.onOrientationChange);
  }
  
  private onResize = (): void => {
    // Actualizamos el DPR por si cambió de pantalla (ej. mover de retina a monitor normal)
    const dpr = Math.min(window.devicePixelRatio, 2);
    this.gestor.obtenerRenderer().setPixelRatio(dpr);
    // Ejecutamos el método del GestorEscena que actualiza todo el contexto WebGL en cadena
    this.gestor.redimensionar(window.innerWidth, window.innerHeight);
  }
  
  public destruir(): void {
    window.removeEventListener('resize', this.onResize);
    window.removeEventListener('orientationchange', this.onOrientationChange);
  }
}
