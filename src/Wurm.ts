import { Sprite } from 'kontra';

export class Wurm extends Sprite {
  public health: number;

  constructor(x: number, y: number, health: number, color: string) {
    super({
      x,
      y,
      color,
      width: 20,
      height: 20,
    });
    this.health = health;
  }

  public takeDamage(amount: number) {
    this.health -= amount;
    if (this.health < 0) {
      this.health = 0;
    }
  }
}
