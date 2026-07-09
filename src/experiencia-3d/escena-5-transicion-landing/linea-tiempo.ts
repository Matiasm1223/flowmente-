import { ControladorScroll } from '../nucleo/controladorScroll';

/**
 * LineaTiempoEscena5: Timeline de la escena 5
 */
export class LineaTiempoEscena5 {
  public registrar(): void {
    ControladorScroll.registrarEscena('escena-5', '.escena-5-trigger', (progreso) => {
      // Stub: Distribuir progreso
    });
  }
}
