import { ControladorScroll } from '../nucleo/controladorScroll';

/**
 * LineaTiempoEscena4: Timeline de la escena 4
 */
export class LineaTiempoEscena4 {
  public registrar(): void {
    ControladorScroll.registrarEscena('escena-4', '.escena-4-trigger', (progreso) => {
      // Stub: Distribuir progreso
    });
  }
}
