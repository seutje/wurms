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
}