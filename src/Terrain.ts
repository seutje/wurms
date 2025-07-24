// Use the ESM build of kontra so Node can correctly import it during training
import kontra from 'kontra/kontra.mjs';
const { GameObject } = kontra;

export class Terrain extends GameObject {
  private terrainCanvas: HTMLCanvasElement;
  private terrainContext: CanvasRenderingContext2D;
  private random: () => number;
  private phases: number[] = [];
  private amplitudes: number[] = [];
  private readonly seed: number;

  constructor(
    width: number,
    height: number,
    context: CanvasRenderingContext2D,
    seed?: number
  ) {
    super({ width, height, context }); // 'context' here is the main canvas context

    this.seed = seed ?? Math.floor(Math.random() * 1e9);
    this.random = this.mulberry32(this.seed);

    this.terrainCanvas = document.createElement('canvas');
    this.terrainCanvas.width = width;
    this.terrainCanvas.height = height;
    this.terrainContext = this.terrainCanvas.getContext('2d')!;

    this.generateNoiseParameters();

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
    const baseHeight = this.height / 2;
    let total = 0;
    for (let i = 0; i < this.phases.length; i++) {
      const freq = 0.005 * Math.pow(2, i);
      total += Math.sin(x * freq + this.phases[i]) * this.amplitudes[i];
    }
    return baseHeight + total;
  };

  private generateNoiseParameters = () => {
    const octaves = 4;
    for (let i = 0; i < octaves; i++) {
      this.phases[i] = this.random() * Math.PI * 2;
      this.amplitudes[i] =
        (this.height / 4) * (0.5 ** i) * (0.5 + this.random() * 0.5);
    }
  };

  private mulberry32 = (a: number) => {
    return () => {
      let t = (a += 0x6d2b79f5);
      t = Math.imul(t ^ (t >>> 15), t | 1);
      t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
      return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
    };
  };
}
