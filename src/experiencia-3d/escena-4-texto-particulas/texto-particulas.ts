import * as THREE from 'three';

/**
 * TextoParticulas: Renderiza las partículas que forman el texto
 */
export class TextoParticulas {
  private geometria: THREE.BufferGeometry;
  private material: THREE.ShaderMaterial;
  private puntos: THREE.Points;
  
  constructor() {
    this.geometria = new THREE.BufferGeometry();
    this.material = new THREE.ShaderMaterial({
      // uniform uProgress actualizado en bucleRender
    });
    this.puntos = new THREE.Points(this.geometria, this.material);
  }
  
  public obtenerObjeto(): THREE.Points {
    return this.puntos;
  }
  
  public actualizarProgreso(uProgress: number): void {
    this.material.uniforms.uProgress = { value: uProgress };
  }
}
