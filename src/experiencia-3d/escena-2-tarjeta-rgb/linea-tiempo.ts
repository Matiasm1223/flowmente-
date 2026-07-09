import { ControladorScroll } from '../nucleo/controladorScroll';

/**
 * LineaTiempoEscena2: Timeline de la escena 2
 */
export class LineaTiempoEscena2 {
  public registrar(): void {
    ControladorScroll.registrarEscena('escena-2', '.escena-2-trigger', (progreso) => {
      // Stub: Distribuir progreso a TarjetaA1, BordeRGB
    });
  }
}
