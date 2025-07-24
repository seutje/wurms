import { Projectile } from './Projectile.js';

export class Grenade extends Projectile {
  public fuse: number;
  public exploded = false;

  constructor(x: number, y: number, dx: number, dy: number, radius: number, damage: number, explosionRadius: number, fuse: number = 180) {
    super(x, y, dx, dy, radius, damage, explosionRadius);
    this.isGrenade = true;
    this.fuse = fuse;
  }

  public update() {
    super.update();
    this.fuse--;
    if (this.fuse <= 0) {
      this.exploded = true;
    }
  }

  public isFuseExpired(): boolean {
    return this.fuse <= 0;
  }
}
