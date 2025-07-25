import { describe, it, expect, vi } from 'vitest';
import { Game } from './Game.js';

vi.mock('kontra/kontra.mjs', async () => {
  const mod = await import('./kontra.mock.js');
  return { default: { Sprite: mod.MockSprite, GameObject: mod.MockGameObject, init: mod.init } };
});

describe('Game spawn positions with seed', () => {
  it('spawns wurms at the same positions with the same seed', () => {
    const canvas = document.createElement('canvas');
    canvas.width = 800;
    canvas.height = 600;
    const ctx = canvas.getContext('2d')!;
    const g1 = new Game(canvas, ctx, 42);
    const g2 = new Game(canvas, ctx, 42);
    expect(g1.playerWurm.x).toBe(g2.playerWurm.x);
    expect(g1.aiWurm.x).toBe(g2.aiWurm.x);
  });

  it('spawns wurms at different positions with different seeds', () => {
    const canvas = document.createElement('canvas');
    canvas.width = 800;
    canvas.height = 600;
    const ctx = canvas.getContext('2d')!;
    const g1 = new Game(canvas, ctx, 1);
    const g2 = new Game(canvas, ctx, 2);
    expect(g1.playerWurm.x).not.toBe(g2.playerWurm.x);
    expect(g1.aiWurm.x).not.toBe(g2.aiWurm.x);
  });

  it('spawns at same positions after reset with same seed', () => {
    const canvas = document.createElement('canvas');
    canvas.width = 800;
    canvas.height = 600;
    const ctx = canvas.getContext('2d')!;
    const game = new Game(canvas, ctx, 5);
    const playerX = game.playerWurm.x;
    const aiX = game.aiWurm.x;
    game.reset();
    expect(game.playerWurm.x).toBe(playerX);
    expect(game.aiWurm.x).toBe(aiX);
  });
});
