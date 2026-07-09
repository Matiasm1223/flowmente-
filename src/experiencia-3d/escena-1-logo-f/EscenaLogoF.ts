import * as THREE from 'three';
import type { IEscena } from '../nucleo/tipos';
import type { GestorEscena } from '../nucleo/gestorEscena';
import { GestorRecursos } from '../nucleo/gestorRecursos';
import { LineaTiempoEscenaLogoF } from './timelineEscenaLogoF';
import { SistemaParticulasExplosionF } from './sistemaParticulasExplosionF';

/**
 * EscenaLogoF: Gestiona la primera escena (Logo F girando y material metálico)
 */
export class EscenaLogoF implements IEscena {
  private grupo: THREE.Group;
  private modeloF: THREE.Group | null = null;
  private sistemaParticulas: SistemaParticulasExplosionF | null = null;
  // Rotación base continua desacoplada de GSAP
  private velocidadRotacionBase: number = 0.8; // radianes por segundo
  private rotacionActual: number = 0;
  
  // Variables animadas directamente por GSAP
  public velocidadExtraGSAP: number = 0;
  public progresoExplosion: { valor: number } = { valor: 0 };
  
  public materialPremium: THREE.MeshStandardMaterial | null = null;
  public promesaIntro: Promise<void> | null = null;
  
  constructor() {
    this.grupo = new THREE.Group();
  }

  public async inicializar(gestorEscena: GestorEscena): Promise<void> {
    const escena = gestorEscena.obtenerEscena();
    escena.add(this.grupo);

    // Hito 3: Carga del modelo optimizado
    try {
      this.modeloF = await GestorRecursos.cargarModelo('/modelos-3d/logo-f-opt.glb');
      
      // Añadir luces a la escena temporalmente (luego moveremos esto a un gestor de luces)
      const ambientLight = new THREE.AmbientLight(0xffffff, 0.5);
      gestorEscena.obtenerEscena().add(ambientLight);

      // Color original exacto según directriz
      const colorOriginal = new THREE.Color(0x1AB8B8);
      // Saturarlo según el requerimiento
      const hsl = { h: 0, s: 0, l: 0 };
      colorOriginal.getHSL(hsl);
      colorOriginal.setHSL(hsl.h, 1.0, hsl.l); // Saturación al máximo

      // Hito 4: Material 100% metálico y rugoso
      this.modeloF.traverse((hijo) => {
        if ((hijo as THREE.Mesh).isMesh) {
          const mesh = hijo as THREE.Mesh;
          if (mesh.material) {
            const materialOriginal = mesh.material as THREE.MeshStandardMaterial;

              this.materialPremium = new THREE.MeshStandardMaterial({
                map: materialOriginal.map,
                color: colorOriginal,
                metalness: 2.0,
                roughness: 0.5,
                emissive: colorOriginal, // Emissive usa el mismo color para disparar el bloom
                emissiveIntensity: 0 // Inicia apagado
              });
              mesh.material = this.materialPremium;
            }
            
            // Solo si es el primer mesh (o queremos un mesh específico) inicializamos partículas
            if (!this.sistemaParticulas && mesh.geometry) {
           console.log('[DIAG] CREATING PARTICLES FROM MESH', mesh.name, 'Vertices:', mesh.geometry.attributes.position.count);
           this.sistemaParticulas = new SistemaParticulasExplosionF(colorOriginal);
           this.sistemaParticulas.inicializarDesdeModelo(mesh, gestorEscena.rendererInfo.esGamaBaja);
           this.grupo.add(this.sistemaParticulas.obtenerObjeto());
           console.log('[DIAG] PARTICLES ADDED TO GROUP', this.grupo.children.length);
        }
      }
    });

      // Centrar y escalar
      this.modeloF.scale.set(3, 3, 3); // Ajustar según escala real
      
      // Escalar partículas también para que coincida
      if (this.sistemaParticulas) {
         this.sistemaParticulas.obtenerObjeto().scale.set(3, 3, 3);
      }
      
      // Centrar pivote
      const box = new THREE.Box3().setFromObject(this.modeloF);
      const center = box.getCenter(new THREE.Vector3());
      this.modeloF.position.x += (this.modeloF.position.x - center.x);
      this.modeloF.position.y += (this.modeloF.position.y - center.y);
      this.modeloF.position.z += (this.modeloF.position.z - center.z);
      
      if (this.sistemaParticulas) {
         this.sistemaParticulas.obtenerObjeto().position.copy(this.modeloF.position);
      }
      
      this.grupo.add(this.modeloF);
      
    } catch (e) {
      console.error('Error cargando logo-f-opt.glb', e);
    }

    // DECISIÓN: se usa IBL exclusivamente para la iluminación (ver .antigravity/progress.md).
    // No se agregan luces adicionales al grupo.

    // Inicializar Timeline GSAP
    const timeline = new LineaTiempoEscenaLogoF(this);
    this.promesaIntro = timeline.registrar();
  }
  
  public actualizar(deltaTime: number): void {
    if (this.modeloF && this.materialPremium) {
      // Rotación base + aceleración directa de GSAP
      const velocidadTotal = this.velocidadRotacionBase + this.velocidadExtraGSAP;
      this.rotacionActual += velocidadTotal * deltaTime;
      
      this.modeloF.rotation.y = this.rotacionActual;
      
      // El bloom ya es animado directamente por GSAP sobre materialPremium.emissiveIntensity

      // Movimiento continuo orgánico vertical
      this.modeloF.position.y = Math.sin(performance.now() * 0.002) * 0.1;
    }
    
    if (this.sistemaParticulas) {
      this.sistemaParticulas.obtenerObjeto().rotation.y = this.rotacionActual;
      this.sistemaParticulas.actualizarProgreso(this.progresoExplosion.valor, deltaTime);
    }
  }

  public detonarExplosion(): void {
    if (this.modeloF) {
      this.modeloF.visible = false;
    }
    // Activar partículas exactamente en el mismo frame que desaparece el logo
    if (this.sistemaParticulas) {
      this.sistemaParticulas.activar();
    }
  }

  public destruir(): void {
    // Liberar material
    if (this.materialPremium) {
      this.materialPremium.dispose();
      this.materialPremium = null;
    }

    // Liberar geometrías y materiales del modelo GLB
    if (this.modeloF) {
      this.modeloF.traverse((hijo) => {
        if ((hijo as THREE.Mesh).isMesh) {
          const mesh = hijo as THREE.Mesh;
          if (mesh.geometry) mesh.geometry.dispose();
          // El material premium ya fue liberado arriba
        }
      });
      this.grupo.remove(this.modeloF);
      this.modeloF = null;
    }

    // Liberar sistema de partículas
    if (this.sistemaParticulas) {
      const puntos = this.sistemaParticulas.obtenerObjeto();
      if (puntos.geometry) puntos.geometry.dispose();
      if (puntos.material) (puntos.material as THREE.Material).dispose();
      this.grupo.remove(puntos);
      this.sistemaParticulas = null;
    }

    // Remover grupo de la escena principal (se asume que GestorEscena maneja su root)
    if (this.grupo.parent) {
      this.grupo.parent.remove(this.grupo);
    }
  }
}
