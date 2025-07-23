// Use the ESM build of kontra so Node can correctly import it during training
import kontra from 'kontra/kontra.mjs';
const { GameObject } = kontra;

export class Terrain extends GameObject {
  private terrainCanvas: HTMLCanvasElement;
  private terrainContext: CanvasRenderingContext2D;

  constructor(width: number, height: number) {
    super({ width, height });
    this.terrainCanvas = document.createElement('canvas');
    this.terrainCanvas.width = width;
    this.terrainCanvas.height = height;
    this.terrainContext = this.terrainCanvas.getContext('2d')!;

    const noiseScale = 0.01;
    const perlin = (x: number) => {
      // Simple Perlin noise implementation
      let n = 0;
      let a = 1;
      let f = 0.05;
      for (let o = 0; o < 4; o++) {
        n += Math.sin(x * f) * a;
        a *= 0.5;
        f *= 2;
      }
      return n;
    };

    this.terrainContext.fillStyle = '#8B4513';
    for (let x = 0; x < this.width; x++) {
      const noiseVal = perlin(x * noiseScale);
      const y = (noiseVal * (this.height / 4)) + (this.height / 2);
      this.terrainContext.fillRect(x, y, 1, this.height - y);
    }
  }

  public draw() {
    this.context.drawImage(this.terrainCanvas, 0, 0);
  }

  public destroy = (x: number, y: number, radius: number) => {
    this.terrainContext.globalCompositeOperation = 'destination-out';
    this.terrainContext.beginPath();
    this.terrainContext.arc(x, y, radius, 0, Math.PI * 2);
    this.terrainContext.fill();
    this.terrainContext.globalCompositeOperation = 'source-over';
  };

  public isColliding = (x: number, y: number): boolean => {
    if (x < 0 || x >= this.width || y < 0 || y >= this.height) {
      return false;
    }
    const pixel = this.terrainContext.getImageData(x, y, 1, 1).data;
    return pixel[3] > 0;
  };
}