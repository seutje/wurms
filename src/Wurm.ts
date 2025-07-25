// Use kontra's ESM entry so training can run in Node
import kontra from 'kontra/kontra.mjs';
const { Sprite } = kontra;

export class Wurm extends Sprite {

  public health: number;
  public barrelAngle = 0;

  constructor(x: number, y: number, health: number, color: string) {
    const width = 30;
    const height = 10;
    super({
      x,
      y: y - height, // Adjust y to account for sprite height
      color,
      width,
      height,
    });
    this.health = health;
    this.dy = 0; // ensure dy is defined for gravity calculations
  }

  public draw = () => {
    // body with outline
    this.context.fillStyle = this.color;
    this.context.strokeStyle = 'black';
    this.context.lineWidth = 2;
    this.context.beginPath();
    this.context.rect(this.x, this.y, this.width, this.height);
    this.context.fill();
    this.context.stroke();

    // head at the bottom of the body
    const headRadius = this.height / 2;
    const headX = this.x + this.width / 2;
    const headY = this.y + this.height + headRadius;
    this.context.beginPath();
    this.context.arc(headX, headY, headRadius, 0, Math.PI * 2);
    this.context.fill();
    this.context.stroke();

    // barrel showing current angle
    const centerX = this.x + this.width / 2;
    const centerY = this.y;
    const length = this.width / 2;
    const radians = this.barrelAngle * Math.PI / 180;
    this.context.strokeStyle = 'white';
    this.context.lineWidth = 3;
    this.context.beginPath();
    this.context.moveTo(centerX, centerY);
    this.context.lineTo(centerX + Math.cos(radians) * length, centerY - Math.sin(radians) * length);
    this.context.stroke();
  }

  public takeDamage = (amount: number) => {
    this.health -= amount;
    if (this.health < 0) {
      this.health = 0;
    }
  }

  public collidesWith = (projectile: any): boolean => {
    const circleX = projectile.x + projectile.radius;
    const circleY = projectile.y + projectile.radius;

    const rectX = this.x;
    const rectY = this.y;
    const rectW = this.width;
    const rectH = this.height;

    const distX = Math.abs(circleX - (rectX + rectW / 2));
    const distY = Math.abs(circleY - (rectY + rectH / 2));

    if (distX > rectW / 2 + projectile.radius) return false;
    if (distY > rectH / 2 + projectile.radius) return false;

    if (distX <= rectW / 2) return true;
    if (distY <= rectH / 2) return true;

    const dx = distX - rectW / 2;
    const dy = distY - rectH / 2;
    return dx * dx + dy * dy <= projectile.radius * projectile.radius;
  }

  public update = (terrain?: any) => {
    if (terrain) {
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
}
