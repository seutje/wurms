export class Explosion {
  private x: number;
  private y: number;
  private maxRadius: number;
  private duration: number;
  private frame: number = 0;

  constructor(x: number, y: number, maxRadius: number, duration = 30) {
    this.x = x;
    this.y = y;
    this.maxRadius = maxRadius;
    this.duration = duration;
  }

  public update() {
    this.frame++;
  }

  public draw(context: CanvasRenderingContext2D) {
    const progress = this.frame / this.duration;
    const radius = this.maxRadius * progress;
    context.save();
    context.globalAlpha = 1 - progress;
    context.fillStyle = 'orange';
    context.beginPath();
    context.arc(this.x, this.y, radius, 0, Math.PI * 2);
    context.fill();
    context.restore();
  }

  public isDone(): boolean {
    return this.frame >= this.duration;
  }
}
