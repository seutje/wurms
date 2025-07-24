import kontra from 'kontra/kontra.mjs';
const { init } = kontra;
import { Terrain } from './Terrain.js';
import { Projectile } from './Projectile.js';
import { Wurm } from './Wurm.js';
import { weaponProperties } from './WeaponProperties.js';
import { handleProjectileWurmCollision } from './collision.js';
import { Explosion } from './Explosion.js';

export class Game {
  public terrain: Terrain;
  public playerWurm: Wurm;
  public aiWurm: Wurm;
  public projectiles: Projectile[] = [];
  public currentTurnProjectiles: Projectile[] = [];
  public explosions: Explosion[] = [];
  private canvas: HTMLCanvasElement;
  private context: CanvasRenderingContext2D;

  private getSpawnPositions() {
    const edgeBuffer = 20;
    const minDistance = 150;
    const range = this.canvas.width - edgeBuffer * 2;
    let playerX = edgeBuffer + Math.random() * range;
    let aiX = edgeBuffer + Math.random() * range;
    let attempts = 0;
    while (Math.abs(playerX - aiX) < minDistance && attempts < 100) {
      aiX = edgeBuffer + Math.random() * range;
      attempts++;
    }
    return [playerX, aiX] as const;
  }

  private circleIntersectsRect(
    cx: number,
    cy: number,
    radius: number,
    rectX: number,
    rectY: number,
    rectW: number,
    rectH: number
  ): boolean {
    const distX = Math.abs(cx - (rectX + rectW / 2));
    const distY = Math.abs(cy - (rectY + rectH / 2));

    if (distX > rectW / 2 + radius) return false;
    if (distY > rectH / 2 + radius) return false;

    if (distX <= rectW / 2) return true;
    if (distY <= rectH / 2) return true;

    const dx = distX - rectW / 2;
    const dy = distY - rectH / 2;
    return dx * dx + dy * dy <= radius * radius;
  }

  private applyExplosionDamage(
    x: number,
    y: number,
    radius: number,
    damage: number
  ) {
    const damageWurm = (wurm: Wurm) => {
      if (
        this.circleIntersectsRect(
          x,
          y,
          radius,
          wurm.x,
          wurm.y,
          wurm.width,
          wurm.height
        )
      ) {
        wurm.takeDamage(damage);
      }
    };
    damageWurm(this.playerWurm);
    damageWurm(this.aiWurm);
  }

  private mapSeed?: number;

  constructor(
    canvas: HTMLCanvasElement,
    context: CanvasRenderingContext2D,
    seed?: number
  ) {
    this.canvas = canvas;
    this.context = context;
    init(canvas);
    this.mapSeed = seed;
    this.terrain = new Terrain(canvas.width, canvas.height, context, seed);
    const [playerX, aiX] = this.getSpawnPositions();
    this.playerWurm = new Wurm(playerX, this.terrain.getGroundHeight(playerX), 100, 'blue');
    this.aiWurm = new Wurm(aiX, this.terrain.getGroundHeight(aiX), 100, 'red');
  }

  public reset(seed?: number) {
    this.mapSeed = seed ?? this.mapSeed;
    this.terrain = new Terrain(
      this.canvas.width,
      this.canvas.height,
      this.context,
      this.mapSeed
    );
    const [playerX, aiX] = this.getSpawnPositions();
    this.playerWurm.x = playerX;
    this.playerWurm.y = this.terrain.getGroundHeight(playerX) - this.playerWurm.height;
    this.playerWurm.health = 100;
    this.aiWurm.x = aiX;
    this.aiWurm.y = this.terrain.getGroundHeight(aiX) - this.aiWurm.height;
    this.aiWurm.health = 100;
    this.projectiles = [];
    this.currentTurnProjectiles = [];
    this.explosions = [];
  }

  public fire(wurm: Wurm, weapon: string, angle: number, power: number) {
    const { radius, damage, explosionRadius, fuse } = weaponProperties[weapon];
    const radians = angle * Math.PI / 180;
    wurm.barrelAngle = angle;
    const offset = wurm.width / 2 + radius + 5;
    const startX = wurm.x + wurm.width / 2 + Math.cos(radians) * offset - radius;
    const startY = wurm.y + wurm.height / 2 - Math.sin(radians) * offset - radius;
    const velX = power * Math.cos(radians) * 0.15;
    const velY = power * Math.sin(radians) * -0.15;

    const projectile = new Projectile(
      startX,
      startY,
      velX,
      velY,
      radius,
      damage,
      explosionRadius,
      fuse
    );
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

  public update() {
    this.playerWurm.update(this.terrain);
    this.aiWurm.update(this.terrain);
    for (let i = this.projectiles.length - 1; i >= 0; i--) {
      const projectile = this.projectiles[i];
      const prevX = projectile.x;
      const prevY = projectile.y;
      projectile.update();

      if (projectile.x < 0) {
        projectile.x = 0;
        projectile.dx = -projectile.dx;
      } else if (projectile.x + projectile.radius * 2 > this.canvas.width) {
        projectile.x = this.canvas.width - projectile.radius * 2;
        projectile.dx = -projectile.dx;
      }

      if (projectile.fuse <= 0 && handleProjectileWurmCollision(projectile, this.playerWurm, this.terrain)) {
        console.log('Player hit!');
        this.explosions.push(
          new Explosion(
            projectile.x + projectile.radius,
            projectile.y + projectile.radius,
            projectile.explosionRadius
          )
        );
        this.applyExplosionDamage(
          projectile.x + projectile.radius,
          projectile.y + projectile.radius,
          projectile.explosionRadius,
          projectile.damage
        );
        this.projectiles.splice(i, 1);
        this.removeFromCurrent(projectile);
        continue;
      }
      if (projectile.fuse <= 0 && handleProjectileWurmCollision(projectile, this.aiWurm, this.terrain)) {
        console.log('AI Wurm hit!');
        this.explosions.push(
          new Explosion(
            projectile.x + projectile.radius,
            projectile.y + projectile.radius,
            projectile.explosionRadius
          )
        );
        this.applyExplosionDamage(
          projectile.x + projectile.radius,
          projectile.y + projectile.radius,
          projectile.explosionRadius,
          projectile.damage
        );
        this.projectiles.splice(i, 1);
        this.removeFromCurrent(projectile);
        continue;
      }

      if (this.terrain.isColliding(projectile.x + projectile.radius, projectile.y + projectile.radius)) {
        if (projectile.fuse > 0) {
          const verticalCollision = this.terrain.isColliding(
            prevX + projectile.radius,
            projectile.y + projectile.radius
          );
          const horizontalCollision = this.terrain.isColliding(
            projectile.x + projectile.radius,
            prevY + projectile.radius
          );
          projectile.x = prevX;
          projectile.y = prevY;
          if (horizontalCollision && !verticalCollision) {
            projectile.dx = -projectile.dx * 0.5;
            projectile.dy *= 0.7;
          } else if (verticalCollision && !horizontalCollision) {
            projectile.dy = -projectile.dy * 0.5;
            projectile.dx *= 0.7;
          } else if (Math.abs(projectile.dx) > Math.abs(projectile.dy)) {
            projectile.dx = -projectile.dx * 0.5;
            projectile.dy *= 0.7;
          } else {
            projectile.dy = -projectile.dy * 0.5;
            projectile.dx *= 0.7;
          }
        } else {
          this.terrain.destroy(
            projectile.x + projectile.radius,
            projectile.y + projectile.radius,
            projectile.explosionRadius
          );
          this.explosions.push(
            new Explosion(
              projectile.x + projectile.radius,
              projectile.y + projectile.radius,
              projectile.explosionRadius
            )
          );
          this.applyExplosionDamage(
            projectile.x + projectile.radius,
            projectile.y + projectile.radius,
            projectile.explosionRadius,
            projectile.damage
          );
          this.projectiles.splice(i, 1);
          this.removeFromCurrent(projectile);
          continue;
        }
      } else if (
        projectile.x + projectile.radius * 2 < 0 ||
        projectile.x > this.canvas.width ||
        projectile.y > this.canvas.height
      ) {
        this.projectiles.splice(i, 1);
        this.removeFromCurrent(projectile);
        continue;
      }

      if (projectile.initialFuse > 0 && projectile.fuse <= 0) {
        this.terrain.destroy(projectile.x + projectile.radius, projectile.y + projectile.radius, projectile.explosionRadius);
        this.explosions.push(
          new Explosion(
            projectile.x + projectile.radius,
            projectile.y + projectile.radius,
            projectile.explosionRadius
          )
        );
        this.applyExplosionDamage(
          projectile.x + projectile.radius,
          projectile.y + projectile.radius,
          projectile.explosionRadius,
          projectile.damage
        );
        this.projectiles.splice(i, 1);
        this.removeFromCurrent(projectile);
        continue;
      }

      if (projectile.fuse > 0) {
        projectile.fuse--;
      }
    }

    for (let i = this.explosions.length - 1; i >= 0; i--) {
      const explosion = this.explosions[i];
      explosion.update();
      if (explosion.isDone()) {
        this.explosions.splice(i, 1);
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
    for (const explosion of this.explosions) {
      explosion.draw(this.context);
    }
  }
}

