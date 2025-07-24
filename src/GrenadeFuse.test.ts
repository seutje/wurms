import { describe, it, expect, vi } from 'vitest';
import { Game } from './Game.js';
import { Projectile } from './Projectile.js';

vi.mock('kontra/kontra.mjs', async () => {
  const mod = await import('./kontra.mock.js');
  return { default: { Sprite: mod.MockSprite, GameObject: mod.MockGameObject, init: mod.init } };
});

describe('Grenade fuse behavior', () => {
  it('bounces then explodes when fuse runs out', () => {
    const canvas = document.createElement('canvas');
    canvas.width = 800;
    canvas.height = 600;
    const ctx = canvas.getContext('2d')!;
    const game = new Game(canvas, ctx);

    const projectile = new Projectile(100, 100, 0, 1, 5, 0, 0, 1);
    game.projectiles.push(projectile);
    game.currentTurnProjectiles.push(projectile);

    vi.spyOn(game.terrain, 'isColliding').mockReturnValue(true);
    game.update();
    expect(projectile.dy).toBe(-1);
    expect(game.projectiles.length).toBe(1);

    (game.terrain.isColliding as any).mockReturnValue(false);
    game.update();
    expect(game.projectiles.length).toBe(0);
  });
});
