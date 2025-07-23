import { describe, it, expect, vi } from 'vitest';
import { Game } from './Game.js';
import { Projectile } from './Projectile.js';

vi.mock('kontra/kontra.mjs', async () => {
  const mod = await import('./kontra.mock.js');
  return { default: { Sprite: mod.MockSprite, GameObject: mod.MockGameObject, init: mod.init } };
});

describe('Projectile side boundary behavior', () => {
  it('bounces off the left wall', () => {
    const canvas = document.createElement('canvas');
    canvas.width = 800;
    canvas.height = 600;
    const ctx = canvas.getContext('2d')!;
    const game = new Game(canvas, ctx);

    const projectile = new Projectile(-1, 100, -2, 0, 5, 0, 0);
    game.projectiles.push(projectile);
    game.currentTurnProjectiles.push(projectile);

    game.update();

    expect(projectile.dx).toBe(2);
    expect(game.projectiles.length).toBe(1);
  });

  it('bounces off the right wall', () => {
    const canvas = document.createElement('canvas');
    canvas.width = 800;
    canvas.height = 600;
    const ctx = canvas.getContext('2d')!;
    const game = new Game(canvas, ctx);

    const projectile = new Projectile(791, 100, 2, 0, 5, 0, 0);
    game.projectiles.push(projectile);
    game.currentTurnProjectiles.push(projectile);

    game.update();

    expect(projectile.dx).toBe(-2);
    expect(game.projectiles.length).toBe(1);
  });
});
