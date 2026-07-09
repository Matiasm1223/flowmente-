import { ControladorScroll } from '../nucleo/controladorScroll';

/**
 * LineaTiempoEscena3: Timeline de la escena 3
 */
export class LineaTiempoEscena3 {
  public registrar(): void {
    ControladorScroll.registrarEscena('escena-3', '.escena-3-trigger', (progreso) => {
      // Stub: Distribuir progreso a ReproductorFotogramas, etc.
    });
  }
}
