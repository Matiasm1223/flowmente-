/**
 * ReproductorFotogramas: Controla el canvas 2D nativo para los WebP
 */
export class ReproductorFotogramas {
  private canvas: HTMLCanvasElement;
  private ctx: CanvasRenderingContext2D | null;
  private fotogramas: HTMLImageElement[] = [];
  
  constructor(canvas: HTMLCanvasElement) {
    this.canvas = canvas;
    this.ctx = canvas.getContext('2d');
  }
  
  public setFotogramas(fotogramas: HTMLImageElement[]): void {
    this.fotogramas = fotogramas;
  }
  
  public actualizar(progreso: number): void {
    if (!this.ctx || this.fotogramas.length === 0) return;
    
    const indice = Math.floor(progreso * (this.fotogramas.length - 1));
    const fotograma = this.fotogramas[indice];
    
    if (fotograma) {
      this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);
      this.ctx.drawImage(fotograma, 0, 0, this.canvas.width, this.canvas.height);
    }
  }
}
