import { Projectile } from './Projectile.js';

export class Grenade extends Projectile {
  public fuse: number;

  constructor(x: number, y: number, dx: number, dy: number, radius: number, damage: number, explosionRadius: number, fuse: number = 180) {
    super(x, y, dx, dy, radius, damage, explosionRadius);
    this.fuse = fuse;
  }

  public update() {
    super.update();
    this.fuse--;
  }

  public isFuseExpired(): boolean {
    return this.fuse <= 0;
  }
}
