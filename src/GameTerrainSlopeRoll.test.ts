import { describe, it, expect, vi } from 'vitest';
import { Game } from './Game.js';
import { Projectile } from './Projectile.js';

vi.mock('kontra/kontra.mjs', async () => {
  const mod = await import('./kontra.mock.js');
  return { default: { Sprite: mod.MockSprite, GameObject: mod.MockGameObject, init: mod.init } };
});

describe('Projectile terrain slope behavior', () => {
  it('rolls down a gentle slope', () => {
    const canvas = document.createElement('canvas');
    canvas.width = 800;
    canvas.height = 600;
    const ctx = canvas.getContext('2d')!;
    const game = new Game(canvas, ctx);

    const projectile = new Projectile(100, 100, 1, 0.2, 5, 0, 0, 1);
    game.projectiles.push(projectile);
    game.currentTurnProjectiles.push(projectile);

    vi.spyOn(game.terrain, 'isColliding').mockReturnValue(true);
    vi.spyOn(game.terrain, 'getSlope').mockReturnValue(0.2);

    game.update();

    expect(projectile.dy).toBe(0);
    expect(projectile.dx).toBeCloseTo(0.936, 3);
  });
});
