import { describe, it, expect, vi } from 'vitest';
import { Game } from './Game.js';
import { Projectile } from './Projectile.js';

vi.mock('kontra/kontra.mjs', async () => {
  const mod = await import('./kontra.mock.js');
  return { default: { Sprite: mod.MockSprite, GameObject: mod.MockGameObject, init: mod.init } };
});

describe('Projectile terrain wall behavior', () => {
  it('bounces off a vertical terrain wall', () => {
    const canvas = document.createElement('canvas');
    canvas.width = 800;
    canvas.height = 600;
    const ctx = canvas.getContext('2d')!;
    const game = new Game(canvas, ctx);

    const projectile = new Projectile(94, 100, 2, 0, 5, 0, 0, 1);
    game.projectiles.push(projectile);
    game.currentTurnProjectiles.push(projectile);

    vi.spyOn(game.terrain, 'isColliding').mockImplementation((x: number) => x >= 100);
    vi.spyOn(game.terrain, 'getSlope').mockReturnValue(1e6);

    game.update();

    expect(projectile.dx).toBeCloseTo(-1, 3);
    expect(projectile.dy).toBeCloseTo(0, 3);
    expect(game.projectiles.length).toBe(1);
  });
});
