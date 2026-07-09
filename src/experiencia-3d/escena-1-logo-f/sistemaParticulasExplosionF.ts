import * as THREE from 'three';
import vertexShader from './shaders/particulas.vert.glsl?raw';
import fragmentShader from './shaders/particulas.frag.glsl?raw';
import { paletaColores } from '../../compartido/constantes';


/**
 * ExplosionParticulas: BufferGeometry y shaders para la explosión del logo
 */
export class SistemaParticulasExplosionF {
  private geometria: THREE.BufferGeometry;
  private material: THREE.ShaderMaterial;
  private puntos: THREE.Points;
  
  constructor(colorParticulas: THREE.Color) {
    this.geometria = new THREE.BufferGeometry();
    
    this.material = new THREE.ShaderMaterial({
      vertexShader,
      fragmentShader,
      uniforms: {
        uProgress: { value: 0 },
        uColor: { value: colorParticulas },
        uTime: { value: 0 },
        uEsGamaBaja: { value: 0.0 },
        uDPR: { value: 1.0 }
      },
      transparent: true,
      blending: THREE.AdditiveBlending,
      depthWrite: false
    });
    
    this.puntos = new THREE.Points(this.geometria, this.material);
    this.puntos.visible = false; // Oculto hasta el clímax — NUNCA visible antes de detonarExplosion()
  }

  public inicializarDesdeModelo(mesh: THREE.Mesh, esGamaBaja: boolean = false): void {
    const meshGeometry = mesh.geometry as THREE.BufferGeometry;
    const vertexCount = meshGeometry.attributes.position.count;

    // Presupuesto adaptativo según el dispositivo
    const maxParticulas = esGamaBaja ? 1000 : 15000;
    const particulasReales = Math.min(vertexCount, maxParticulas);
    
    // Inyectar estado al shader para compensar falta de Bloom en móviles
    this.material.uniforms.uEsGamaBaja.value = esGamaBaja ? 1.0 : 0.0;
    
    // Inyectar DPR capado que usa el renderer (hasta 1.5 en gama baja, 2.0 en normal)
    this.material.uniforms.uDPR.value = Math.min(window.devicePixelRatio, esGamaBaja ? 1.5 : 2.0);

    const posiciones = new Float32Array(particulasReales * 3);
    const randomDirs = new Float32Array(particulasReales * 3);
    const randomSizes = new Float32Array(particulasReales);

    // Selección de índices aleatorios para evitar clustering
    const indicesUsados = new Set<number>();
    while (indicesUsados.size < particulasReales && indicesUsados.size < vertexCount) {
      indicesUsados.add(Math.floor(Math.random() * vertexCount));
    }

    const tempVector = new THREE.Vector3();
    const positionAttribute = meshGeometry.attributes.position;

    let idx = 0;
    for (const i of indicesUsados) {
      // Usar fromBufferAttribute extrae el valor real float des-cuantizado
      tempVector.fromBufferAttribute(positionAttribute, i);
      
      posiciones[idx * 3] = tempVector.x;
      posiciones[idx * 3 + 1] = tempVector.y;
      posiciones[idx * 3 + 2] = tempVector.z;

      // Dirección random esférica
      const phi = Math.acos(-1 + (2 * idx) / particulasReales);
      const theta = Math.sqrt(particulasReales * Math.PI) * phi;
      
      randomDirs[idx * 3] = Math.cos(theta) * Math.sin(phi);
      randomDirs[idx * 3 + 1] = Math.sin(theta) * Math.sin(phi);
      randomDirs[idx * 3 + 2] = Math.cos(phi);

      randomSizes[idx] = 1.0; // DEBUG: Tamaño constante máximo
      idx++;
    }

    // Sanity check para geometrías colapsadas por cuantización
    const bbox = new THREE.Box3();
    bbox.setFromArray(posiciones);
    const size = bbox.getSize(new THREE.Vector3());
    if (size.x < 0.01 || size.y < 0.01) {
      console.warn('Partículas colapsadas — geometría posiblemente cuantizada en exceso');
    }

    this.geometria.setAttribute('position', new THREE.BufferAttribute(posiciones, 3));
    this.geometria.setAttribute('aRandomDir', new THREE.BufferAttribute(randomDirs, 3));
    this.geometria.setAttribute('aRandomSize', new THREE.BufferAttribute(randomSizes, 1));
    this.puntos = new THREE.Points(this.geometria, this.material);
    this.puntos.visible = false; // Mantener oculto hasta el clímax
    this.puntos.frustumCulled = false; // PREVENT CULLING JUST IN CASE
    
    // Aplicamos transformaciones del mesh base para que coincida visualmente
    this.puntos.position.copy(mesh.parent ? mesh.parent.position : mesh.position);
    this.puntos.rotation.copy(mesh.parent ? mesh.parent.rotation : mesh.rotation);
    this.puntos.scale.copy(mesh.parent ? mesh.parent.scale : mesh.scale);
  }
  
  public obtenerObjeto(): THREE.Points {
    return this.puntos;
  }

  /** Activa la visibilidad en el instante exacto del clímax (llamado por detonarExplosion) */
  public activar(): void {
    this.puntos.visible = true;
    setTimeout (()=>{this.puntos.visible= false;},1000);  
  }
  
  public actualizarProgreso(uProgress: number, deltaTime: number): void {
    this.material.uniforms.uProgress.value = uProgress;
    this.material.uniforms.uTime.value += deltaTime;
  }


}
