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
    this.dy = 0; // ensure dy is defined for gravity calculations
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
    // Circular collision detection
    const dx = this.x + this.width / 2 - projectile.x;
    const dy = this.y + this.height / 2 - projectile.y;
    const distance = Math.sqrt(dx * dx + dy * dy);

    return distance < this.width / 2 + projectile.radius;
  }

  public update = (terrain: any) => {
    const belowX = Math.floor(this.x + this.width / 2);
    const belowY = Math.floor(this.y + this.height + 1);
    if (!terrain.isColliding(belowX, belowY)) {
      this.dy += 0.2;
      this.y += this.dy;
    } else {
      this.dy = 0;
    }
  }
}
