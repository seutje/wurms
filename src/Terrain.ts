// Use the ESM build of kontra so Node can correctly import it during training
import kontra from 'kontra/kontra.mjs';
const { GameObject } = kontra;

export class Terrain extends GameObject {
  private terrainCanvas: HTMLCanvasElement;
  private terrainContext: CanvasRenderingContext2D;

  constructor(width: number, height: number, context: CanvasRenderingContext2D) {
    super({ width, height, context }); // 'context' here is the main canvas context

    this.terrainCanvas = document.createElement('canvas');
    this.terrainCanvas.width = width;
    this.terrainCanvas.height = height;
    this.terrainContext = this.terrainCanvas.getContext('2d')!;

    // Draw initial terrain onto the offscreen canvas
    this.drawInitialTerrain();
  }

  private drawInitialTerrain = () => {
    

    this.terrainContext.fillStyle = 'green';
    this.terrainContext.beginPath();
    this.terrainContext.moveTo(0, this.getGroundHeight(0));
    for (let x = 0; x < this.width; x++) {
      this.terrainContext.lineTo(x, this.getGroundHeight(x));
    }
    this.terrainContext.lineTo(this.width, this.height);
    this.terrainContext.lineTo(0, this.height);
    this.terrainContext.closePath();
    this.terrainContext.fill();
  };

  public draw = () => {
    // Draw the offscreen canvas onto the main canvas
    this.context.drawImage(this.terrainCanvas, 0, 0);
  };

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
    // Check collision against the offscreen canvas
    const pixel = this.terrainContext.getImageData(x, y, 1, 1).data;
    return pixel[3] > 0;
  };

  public getGroundHeight = (x: number): number => {
    const noiseScale = 0.01;
    const perlin = (val: number) => {
      let n = 0;
      let a = 1;
      let f = 0.05;
      for (let o = 0; o < 4; o++) {
        n += Math.sin(val * f) * a;
        a *= 0.5;
        f *= 2;
      }
      return n;
    };
    const noiseVal = perlin(x * noiseScale);
    return (noiseVal * (this.height / 4)) + (this.height / 2);
  };
}