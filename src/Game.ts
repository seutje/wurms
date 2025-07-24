import kontra from 'kontra/kontra.mjs';
const { init } = kontra;
import { Terrain } from './Terrain.js';
import { Projectile } from './Projectile.js';
import { Grenade } from './Grenade.js';
import { Wurm } from './Wurm.js';
import { weaponProperties } from './WeaponProperties.js';
import { handleProjectileWurmCollision } from './collision.js';

export class Game {
  public terrain: Terrain;
  public playerWurm: Wurm;
  public aiWurm: Wurm;
  public projectiles: Projectile[] = [];
  public currentTurnProjectiles: Projectile[] = [];
  private canvas: HTMLCanvasElement;
  private context: CanvasRenderingContext2D;

  constructor(canvas: HTMLCanvasElement, context: CanvasRenderingContext2D) {
    this.canvas = canvas;
    this.context = context;
    init(canvas);
    this.terrain = new Terrain(canvas.width, canvas.height, context);
    this.playerWurm = new Wurm(100, this.terrain.getGroundHeight(100), 100, 'blue');
    this.aiWurm = new Wurm(canvas.width - 100, this.terrain.getGroundHeight(canvas.width - 100), 100, 'green');
  }

  public reset() {
    this.terrain = new Terrain(this.canvas.width, this.canvas.height, this.context);
    this.playerWurm.x = 100;
    this.playerWurm.y = this.terrain.getGroundHeight(100) - this.playerWurm.height;
    this.playerWurm.health = 100;
    this.aiWurm.x = this.canvas.width - 100;
    this.aiWurm.y = this.terrain.getGroundHeight(this.canvas.width - 100) - this.aiWurm.height;
    this.aiWurm.health = 100;
    this.projectiles = [];
    this.currentTurnProjectiles = [];
  }

  public fire(wurm: Wurm, weapon: string, angle: number, power: number) {
    const { radius, damage, explosionRadius } = weaponProperties[weapon];
    const radians = angle * Math.PI / 180;
    wurm.barrelAngle = angle;
    const offset = wurm.width / 2 + radius + 0.1;
    const startX = wurm.x + wurm.width / 2 + Math.cos(radians) * offset - radius;
    const startY = wurm.y + wurm.height / 2 - Math.sin(radians) * offset - radius;
    const velX = power * Math.cos(radians) * 0.15;
    const velY = power * Math.sin(radians) * -0.15;

    const projectile = weapon === 'grenade'
      ? new Grenade(startX, startY, velX, velY, radius, damage, explosionRadius)
      : new Projectile(startX, startY, velX, velY, radius, damage, explosionRadius);
    this.projectiles.push(projectile);
    this.currentTurnProjectiles.push(projectile);
    return projectile;
  }

  private removeFromCurrent(projectile: Projectile) {
    const idx = this.currentTurnProjectiles.indexOf(projectile);
    if (idx > -1) {
      this.currentTurnProjectiles.splice(idx, 1);
    }
  }

  private applyExplosionDamage(
    x: number,
    y: number,
    radius: number,
    damage: number
  ) {
    const checkDamage = (wurm: Wurm) => {
      const wx = wurm.x + wurm.width / 2;
      const wy = wurm.y + wurm.height / 2;
      const dist = Math.hypot(x - wx, y - wy);
      if (dist <= radius) {
        wurm.takeDamage(damage);
      }
    };
    checkDamage(this.playerWurm);
    checkDamage(this.aiWurm);
  }

  private explodeGrenade(index: number, grenade: Grenade) {
    this.terrain.destroy(
      grenade.x + grenade.radius,
      grenade.y + grenade.radius,
      grenade.explosionRadius
    );
    this.applyExplosionDamage(
      grenade.x + grenade.radius,
      grenade.y + grenade.radius,
      grenade.explosionRadius,
      grenade.damage
    );
    this.projectiles.splice(index, 1);
    this.removeFromCurrent(grenade);
  }

  public update() {
    this.playerWurm.update(this.terrain);
    this.aiWurm.update(this.terrain);
    for (let i = this.projectiles.length - 1; i >= 0; i--) {
      const projectile = this.projectiles[i];
      const prevX = projectile.x;
      const prevY = projectile.y;
      if (typeof projectile.update === 'function') {
        projectile.update();
      }
      if (
        projectile.isGrenade &&
        !(projectile instanceof Projectile) &&
        typeof projectile.fuse === 'number'
      ) {
        projectile.fuse -= 1;
        if (projectile.fuse <= 0) {
          projectile.exploded = true;
        }
      }
      if (projectile.x < 0) {
        projectile.x = 0;
        projectile.dx = -projectile.dx;
      } else if (projectile.x + projectile.radius * 2 > this.canvas.width) {
        projectile.x = this.canvas.width - projectile.radius * 2;
        projectile.dx = -projectile.dx;
      }

      if (projectile.isGrenade) {
        const grenade = projectile as Grenade;
        const hitPlayer = this.playerWurm.collidesWith(grenade);
        const hitAi = this.aiWurm.collidesWith(grenade);
        const hitTerrain = this.terrain.isColliding(
          grenade.x + grenade.radius,
          grenade.y + grenade.radius
        );
        if (hitPlayer || hitAi || hitTerrain) {
          grenade.x = prevX;
          grenade.y = prevY;
          grenade.dy = -grenade.dy * 0.5;
          grenade.dx *= 0.7;
        }
        const fuseExpired = grenade.exploded || grenade.fuse <= 0;
        if (fuseExpired) {
          this.explodeGrenade(i, grenade);
          continue;
        }
        if (
          projectile.x + projectile.radius * 2 < 0 ||
          projectile.x > this.canvas.width ||
          projectile.y > this.canvas.height
        ) {
          this.projectiles.splice(i, 1);
          this.removeFromCurrent(projectile);
        }
        continue;
      }

      if (handleProjectileWurmCollision(projectile, this.playerWurm, this.terrain)) {
        console.log('Player hit!');
        this.projectiles.splice(i, 1);
        this.removeFromCurrent(projectile);
        continue;
      }
      if (handleProjectileWurmCollision(projectile, this.aiWurm, this.terrain)) {
        console.log('AI Wurm hit!');
        this.projectiles.splice(i, 1);
        this.removeFromCurrent(projectile);
        continue;
      }
      if (this.terrain.isColliding(projectile.x + projectile.radius, projectile.y + projectile.radius)) {
        this.terrain.destroy(projectile.x + projectile.radius, projectile.y + projectile.radius, projectile.explosionRadius);
        this.projectiles.splice(i, 1);
        this.removeFromCurrent(projectile);
        if (this.playerWurm.collidesWith(projectile)) {
          this.playerWurm.takeDamage(projectile.damage);
        }
        if (this.aiWurm.collidesWith(projectile)) {
          this.aiWurm.takeDamage(projectile.damage);
        }
      } else if (
        projectile.x + projectile.radius * 2 < 0 ||
        projectile.x > this.canvas.width ||
        projectile.y > this.canvas.height
      ) {
        this.projectiles.splice(i, 1);
        this.removeFromCurrent(projectile);
      }
    }
  }

  public simulateUntilProjectilesResolve(maxIterations = 5000) {
    let iterations = 0;
    while (this.currentTurnProjectiles.length > 0 && iterations < maxIterations) {
      this.update();
      iterations++;
    }
  }

  public draw() {
    this.terrain.draw();
    this.playerWurm.draw();
    this.aiWurm.draw();
    for (const projectile of this.projectiles) {
      projectile.render();
    }
  }
}

