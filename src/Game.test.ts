import { describe, it, expect, vi } from 'vitest';
import { Game } from './Game.js';
import { Projectile } from './Projectile.js';

vi.mock('kontra/kontra.mjs', async () => {
  const mod = await import('./kontra.mock.js');
  return { default: { Sprite: mod.MockSprite, GameObject: mod.MockGameObject, init: mod.init } };
});

describe('Game projectile spawning', () => {
  it('does not damage the player when firing bazooka at 45 deg with power 50', () => {
    const canvas = document.createElement('canvas');
    canvas.width = 800;
    canvas.height = 600;
    const ctx = canvas.getContext('2d')!;
    const game = new Game(canvas, ctx);
    game.fire(game.playerWurm, 'bazooka', 45, 50);
    game.update();
    expect(game.playerWurm.health).toBe(100);
  });

  it('damages wurm when explosion occurs nearby', () => {
    const canvas = document.createElement('canvas');
    canvas.width = 800;
    canvas.height = 600;
    const ctx = canvas.getContext('2d')!;
    const game = new Game(canvas, ctx);
    const projectile = new Projectile(
      game.playerWurm.x + game.playerWurm.width + 1,
      game.playerWurm.y,
      0,
      0,
      5,
      20,
      30,
      0
    );
    game.projectiles.push(projectile);
    game.currentTurnProjectiles.push(projectile);
    vi.spyOn(game.terrain, 'isColliding').mockReturnValue(true);
    game.update();
    expect(game.playerWurm.health).toBe(80);
  });

  it('damages wurm when explosion overlaps but center is outside', () => {
    const canvas = document.createElement('canvas');
    canvas.width = 800;
    canvas.height = 600;
    const ctx = canvas.getContext('2d')!;
    const game = new Game(canvas, ctx);

    const explosionRadius = 5;
    const projectile = new Projectile(
      game.playerWurm.x - explosionRadius - 2,
      game.playerWurm.y,
      0,
      0,
      explosionRadius,
      20,
      explosionRadius,
      0
    );
    game.projectiles.push(projectile);
    game.currentTurnProjectiles.push(projectile);
    vi.spyOn(game.terrain, 'isColliding').mockReturnValue(true);
    game.update();
    expect(game.playerWurm.health).toBe(80);
  });
});
