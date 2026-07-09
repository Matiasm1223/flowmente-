import * as THREE from 'three';

/**
 * CruceALandingReal: Transición final.
 * ÚNICO lugar del proyecto donde se ejecuta dispose() de geometrías/materiales/render targets, 
 * y donde se desmonta la experiencia 3D para revelar Landing.astro.
 */
export class CruceALandingReal {
  public static ejecutarDispose(escena: THREE.Scene, renderer: THREE.WebGLRenderer): void {
    escena.traverse((objeto) => {
      if (objeto instanceof THREE.Mesh || objeto instanceof THREE.Points) {
        if (objeto.geometry) {
          objeto.geometry.dispose();
        }
        if (objeto.material) {
          if (Array.isArray(objeto.material)) {
            objeto.material.forEach((mat) => mat.dispose());
          } else {
            objeto.material.dispose();
          }
        }
      }
    });
    
    renderer.dispose();
  }
}
