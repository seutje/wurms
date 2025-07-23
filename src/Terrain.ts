// Use the ESM build of kontra so Node can correctly import it during training
import kontra from 'kontra/kontra.mjs';
const { GameObject } = kontra;

export class Terrain extends GameObject {
  

  constructor(width: number, height: number, context: CanvasRenderingContext2D) {
    super({ width, height, context });
  }

  

  public destroy = (x: number, y: number, radius: number) => {
    this.context.globalCompositeOperation = 'destination-out';
    this.context.beginPath();
    this.context.arc(x, y, radius, 0, Math.PI * 2);
    this.context.fill();
    this.context.globalCompositeOperation = 'source-over';
  };

  public isColliding = (x: number, y: number): boolean => {
    if (x < 0 || x >= this.width || y < 0 || y >= this.height) {
      return false;
    }
    const pixel = this.context.getImageData(x, y, 1, 1).data;
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