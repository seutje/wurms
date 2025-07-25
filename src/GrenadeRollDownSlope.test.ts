import { describe, it, expect, vi } from 'vitest';
import { Game } from './Game.js';
import { Projectile } from './Projectile.js';

vi.mock('kontra/kontra.mjs', async () => {
  const mod = await import('./kontra.mock.js');
  return { default: { Sprite: mod.MockSprite, GameObject: mod.MockGameObject, init: mod.init } };
});

describe('Grenade rolling on slopes', () => {
  it('accelerates along the slope when on the ground', () => {
    const canvas = document.createElement('canvas');
    canvas.width = 800;
    canvas.height = 600;
    const ctx = canvas.getContext('2d')!;
    const game = new Game(canvas, ctx);

    const projectile = new Projectile(100, 100, 0, 1, 5, 0, 0, 5);
    game.projectiles.push(projectile);
    game.currentTurnProjectiles.push(projectile);

    vi.spyOn(game.terrain, 'isColliding').mockReturnValue(true);
    vi.spyOn(game.terrain, 'getGroundHeight').mockImplementation(x => x);

    game.update();

    expect(projectile.dx).toBeGreaterThan(0);
  });
});
