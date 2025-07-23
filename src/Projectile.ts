import { Sprite } from 'kontra';

export class Projectile extends Sprite {
  constructor(x: number, y: number, dx: number, dy: number) {
    super({
      x,
      y,
      dx,
      dy,
      width: 5,
      height: 5,
      color: 'red',
      update: function() {
        this.dy += 0.1; // gravity
        this.advance();
      }
    });
  }
}