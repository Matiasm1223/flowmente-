import * as THREE from 'three';
import { GLTFLoader } from 'three/examples/jsm/loaders/GLTFLoader.js';
import { MeshoptDecoder } from 'three/examples/jsm/libs/meshopt_decoder.module.js';

/**
 * GestorRecursos: Carga y cachea assets (GLTF, WebP).
 */
export class GestorRecursos {
  private static gltfLoader: GLTFLoader;
  private static cacheModelos: Map<string, THREE.Group> = new Map();

  private static obtenerGLTFLoader(): GLTFLoader {
    if (!this.gltfLoader) {
      this.gltfLoader = new GLTFLoader();
      this.gltfLoader.setMeshoptDecoder(MeshoptDecoder);
    }
    return this.gltfLoader;
  }

  public static async cargarModelo(ruta: string): Promise<THREE.Group> {
    if (this.cacheModelos.has(ruta)) {
      // Retornar un clon para poder instanciarlo múltiples veces si hiciera falta
      const original = this.cacheModelos.get(ruta)!;
      return original.clone(true);
    }

    return new Promise((resolve, reject) => {
      const loader = this.obtenerGLTFLoader();
      loader.load(
        ruta,
        (gltf) => {
          this.cacheModelos.set(ruta, gltf.scene);
          resolve(gltf.scene.clone(true));
        },
        undefined,
        (error) => reject(error)
      );
    });
  }
  
  public static async precargarFotogramas(rutaBase: string, cantidad: number): Promise<HTMLImageElement[]> {
    // Stub para carga de fotogramas WebP
    return Promise.resolve([]);
  }
}
