import * as THREE from 'three';

/**
 * ParticulasInteractivas: Reaccionan a la posición del mouse
 */
export class ParticulasInteractivas {
  private geometria: THREE.BufferGeometry;
  private material: THREE.PointsMaterial;
  private puntos: THREE.Points;
  
  constructor() {
    this.geometria = new THREE.BufferGeometry();
    this.material = new THREE.PointsMaterial({ color: 0x88E8B8 });
    this.puntos = new THREE.Points(this.geometria, this.material);
  }
  
  public obtenerObjeto(): THREE.Points {
    return this.puntos;
  }
  
  public actualizarMouse(x: number, y: number): void {
    // Lógica de interacción de partículas con el mouse
  }
}
