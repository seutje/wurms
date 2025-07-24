// Import from the ESM build so that Node can resolve the module
import kontra from 'kontra/kontra.mjs';
const { Sprite } = kontra;

export class Projectile extends Sprite {

  public radius: number;
  public damage: number;
  public explosionRadius: number;
  public isGrenade = false;
  public fuse = 0;
  public exploded = false;

  constructor(x: number, y: number, dx: number, dy: number, radius: number, damage: number, explosionRadius: number) {
    super({
      x,
      y,
      dx,
      dy,
      width: radius * 2,
      height: radius * 2,
      color: 'red',
      ddy: 0.1 // gravity
    });
    this.x = x;
    this.y = y;
    this.radius = radius;
    this.damage = damage;
    this.explosionRadius = explosionRadius;
  }

  public update() {
    this.advance();
    if (this.isGrenade && typeof this.fuse === 'number') {
      this.fuse--;
      if (this.fuse <= 0) {
        this.exploded = true;
      }
    }
  }
}
