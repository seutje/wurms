export class Explosion {
  protected x: number;
  protected y: number;
  protected maxRadius: number;
  protected duration: number;
  protected frame: number = 0;
  private type: 'normal' | 'nuke';

  constructor(
    x: number,
    y: number,
    maxRadius: number,
    duration = 30,
    type: 'normal' | 'nuke' = 'normal'
  ) {
    this.x = x;
    this.y = y;
    this.maxRadius = maxRadius;
    this.duration = duration;
    this.type = type;
  }

  public update() {
    this.frame++;
  }

  public draw(context: CanvasRenderingContext2D) {
    const progress = this.frame / this.duration;
    const radius = this.maxRadius * progress;
    context.save();
    context.globalAlpha = 1 - progress;
    if (this.type === 'nuke') {
      const gradient = context.createRadialGradient(
        this.x,
        this.y,
        0,
        this.x,
        this.y,
        radius
      );
      gradient.addColorStop(0, 'white');
      gradient.addColorStop(0.3, 'yellow');
      gradient.addColorStop(0.6, 'orange');
      gradient.addColorStop(1, 'red');
      context.fillStyle = gradient;
    } else {
      context.fillStyle = 'orange';
    }
    context.beginPath();
    context.arc(this.x, this.y, radius, 0, Math.PI * 2);
    context.fill();
    context.restore();
  }

  public isDone(): boolean {
    return this.frame >= this.duration;
  }
}
