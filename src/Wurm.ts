// Use kontra's ESM entry so training can run in Node
import kontra from 'kontra/kontra.mjs';
const { Sprite } = kontra;

export class Wurm extends Sprite {
  
  public health: number;

  constructor(x: number, y: number, health: number, color: string) {
    super({
      x,
      y: y - 20, // Adjust y to account for sprite height
      color,
      width: 20,
      height: 20,
    });
    this.health = health;
  }

  public draw = () => {
    this.context.fillStyle = this.color;
    this.context.beginPath();
    this.context.arc(this.x + this.width / 2, this.y + this.height / 2, this.width / 2, 0, Math.PI * 2);
    this.context.fill();
  }

  public takeDamage = (amount: number) => {
    this.health -= amount;
    if (this.health < 0) {
      this.health = 0;
    }
  }

  public collidesWith = (projectile: any): boolean => {
    // Simple bounding box collision detection
    return (
      this.x < projectile.x + projectile.width &&
      this.x + this.width > projectile.x &&
      this.y < projectile.y + projectile.height &&
      this.y + this.height > projectile.y
    );
  }
}
