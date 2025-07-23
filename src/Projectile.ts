import p5 from 'p5';

export class Projectile {
  private pos: p5.Vector;
  private vel: p5.Vector;
  private p: p5;

  constructor(p: p5, pos: p5.Vector, vel: p5.Vector) {
    this.p = p;
    this.pos = pos;
    this.vel = vel;
  }

  public update() {
    this.vel.y += 0.1; // gravity
    this.pos.add(this.vel);
  }

  public draw() {
    this.p.fill(255, 0, 0);
    this.p.ellipse(this.pos.x, this.pos.y, 10, 10);
  }

  public getPosition(): p5.Vector {
    return this.pos;
  }
}
