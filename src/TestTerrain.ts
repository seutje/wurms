
export class TestTerrain {
  private terrainCanvas: HTMLCanvasElement;
  private terrainContext: CanvasRenderingContext2D;
  private width: number;
  private height: number;

  constructor(width: number, height: number) {
    this.width = width;
    this.height = height;
    this.terrainCanvas = document.createElement('canvas');
    this.terrainCanvas.width = width;
    this.terrainCanvas.height = height;
    this.terrainContext = this.terrainCanvas.getContext('2d')!;
  }

  public isColliding(x: number, y: number): boolean {
    if (x < 0 || x >= this.width || y < 0 || y >= this.height) {
      return false;
    }
    const pixel = this.terrainContext.getImageData(x, y, 1, 1).data;
    return pixel[3] > 0;
  }
}
