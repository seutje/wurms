import { describe, it, expect, vi } from 'vitest';
import { Game } from './Game.js';

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
});
