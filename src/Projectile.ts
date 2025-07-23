import kontra from 'kontra';
const { Sprite } = kontra;

export class Projectile extends Sprite {
  
  public radius: number;
  public damage: number;

  constructor(x: number, y: number, dx: number, dy: number, radius: number, damage: number) {
    super({
      x,
      y,
      dx,
      dy,
      width: radius * 2,
      height: radius * 2,
      color: 'red',
    });
    this.x = x;
    this.y = y;
    this.radius = radius;
    this.damage = damage;
  }

  public update() {
    this.dy += 0.1; // gravity
    this.advance();
  }
}
