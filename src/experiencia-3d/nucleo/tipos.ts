import * as THREE from 'three';

export interface IEscena {
  // Inicialización de la escena. Retorna una promesa si carga recursos.
  inicializar(gestorEscena: import('./gestorEscena').GestorEscena): Promise<void> | void;
  
  // Actualiza la escena basado en el delta time (animaciones continuas)
  // El progreso por scroll se inyecta vía callbacks del ControladorScroll
  actualizar(deltaTime: number): void;
  
  // Método opcional para limpieza
  destruir?(): void;
}
