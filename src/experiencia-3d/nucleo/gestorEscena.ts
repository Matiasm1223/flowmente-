import * as THREE from 'three';
import { EffectComposer } from 'three/examples/jsm/postprocessing/EffectComposer.js';
import { RenderPass } from 'three/examples/jsm/postprocessing/RenderPass.js';
import { UnrealBloomPass } from 'three/examples/jsm/postprocessing/UnrealBloomPass.js';
import { RoomEnvironment } from 'three/examples/jsm/environments/RoomEnvironment.js';
import { obtenerDispositivo } from './deteccionDispositivo';

/**
 * GestorEscena: Único renderer, cámara y composer (con UnrealBloomPass).
 * Responsabilidad: Configurar el contexto WebGL compartido y el Environment Map.
 */
export class GestorEscena {
  private renderer: THREE.WebGLRenderer;
  private escena: THREE.Scene;
  private camara: THREE.PerspectiveCamera;
  private composer: EffectComposer | null = null;
  public rendererInfo: { esGamaBaja: boolean };
  
  constructor(canvas: HTMLCanvasElement) {
    this.rendererInfo = { esGamaBaja: obtenerDispositivo().esGamaBaja };
    
    // Configurar Renderer
    this.renderer = new THREE.WebGLRenderer({ 
      canvas, 
      alpha: true, 
      antialias: !this.rendererInfo.esGamaBaja,
      powerPreference: 'high-performance'
    });
    this.renderer.setPixelRatio(Math.min(window.devicePixelRatio, this.rendererInfo.esGamaBaja ? 1.5 : 2));
    this.renderer.setSize(window.innerWidth, window.innerHeight);
    this.renderer.toneMapping = THREE.ACESFilmicToneMapping;
    this.renderer.toneMappingExposure = 1.5;

    // Escena y Cámara
    this.escena = new THREE.Scene();
    this.camara = new THREE.PerspectiveCamera(45, window.innerWidth / window.innerHeight, 0.1, 100);
    this.camara.position.set(0, 0, 10);

    // Environment Map (IBL) para materiales metálicos
    const pmremGenerator = new THREE.PMREMGenerator(this.renderer);
    pmremGenerator.compileEquirectangularShader();
    this.escena.environment = pmremGenerator.fromScene(new RoomEnvironment()).texture;

    // Postprocesado (Bloom)
    if (!this.rendererInfo.esGamaBaja) {
      this.composer = new EffectComposer(this.renderer);
      const renderPass = new RenderPass(this.escena, this.camara);
      this.composer.addPass(renderPass);

      // Parámetros de Bloom: resolution, strength, radius, threshold
      const resolution = new THREE.Vector2(window.innerWidth, window.innerHeight);
      const bloomPass = new UnrealBloomPass(resolution, 1.8, 0.9, 1.77);
      this.composer.addPass(bloomPass);
    }
  }
  
  public renderizar(): void {
    if (this.composer) {
      this.composer.render();
    } else {
      this.renderer.render(this.escena, this.camara);
    }
  }
  
  public redimensionar(width: number, height: number): void {
    this.camara.aspect = width / height;
    this.camara.updateProjectionMatrix();
    this.renderer.setSize(width, height);
    
    if (this.composer) {
      this.composer.setSize(width, height);
    }
  }

  public obtenerEscena(): THREE.Scene {
    return this.escena;
  }
  
  public obtenerCamara(): THREE.PerspectiveCamera {
    return this.camara;
  }
  
  public obtenerRenderer(): THREE.WebGLRenderer {
    return this.renderer;
  }
}
