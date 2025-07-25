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

    game.update();

    expect(projectile.dx).toBe(-0.2);
    expect(projectile.dy).toBe(0);
    expect(game.projectiles.length).toBe(1);
  });
});
