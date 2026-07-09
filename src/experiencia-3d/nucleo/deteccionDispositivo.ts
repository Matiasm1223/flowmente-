/**
 * DeteccionDispositivo: Detecta capacidades para ajustar fidelidad 3D.
 */
export interface InfoDispositivo {
  esMovil: boolean;
  esGamaBaja: boolean;
  prefiereReducirMovimiento: boolean;
}

export function obtenerDispositivo(): InfoDispositivo {
  // Comprobación de seguridad SSR
  if (typeof window === 'undefined') {
    return { esMovil: true, esGamaBaja: true, prefiereReducirMovimiento: true };
  }

  const esMovil = window.innerWidth <= 768 || /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent);
  const prefiereReducirMovimiento = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  const hilos = navigator.hardwareConcurrency || 4;
  
  // Asumimos gama baja si tiene muy pocos hilos
  const esGamaBaja = hilos <= 4;
  
  return {
    esMovil,
    esGamaBaja,
    prefiereReducirMovimiento
  };
}
