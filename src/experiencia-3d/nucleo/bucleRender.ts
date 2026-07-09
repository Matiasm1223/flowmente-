import * as THREE from 'three';
import type { GestorEscena } from './gestorEscena';
import type { IEscena } from './tipos';

/**
 * BucleRender: Loop centralizado de requestAnimationFrame
 */
export class BucleRender {
  private gestorEscena: GestorEscena;
  private animando: boolean = false;
  private reloj: THREE.Clock;
  private escenas: IEscena[] = [];
  
  constructor(gestor: GestorEscena) {
    this.gestorEscena = gestor;
    this.reloj = new THREE.Clock();
  }
  
  public registrarEscena(escena: IEscena): void {
    this.escenas.push(escena);
  }

  public iniciar(): void {
    this.animando = true;
    this.reloj.start();
    this.tick();
  }
  
  public detener(): void {
    this.animando = false;
    this.reloj.stop();
  }
  
  private tick = (): void => {
    if (!this.animando) return;
    
    const deltaTime = this.reloj.getDelta();
    
    // Actualizar todas las escenas registradas
    for (const escena of this.escenas) {
      escena.actualizar(deltaTime);
    }
    
    this.gestorEscena.renderizar();
    requestAnimationFrame(this.tick);
  }
}
