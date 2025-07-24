import { describe, it, expect, vi } from 'vitest';
import { Grenade } from './Grenade.js';
import { Game } from './Game.js';

vi.mock('kontra/kontra.mjs', async () => {
  const mod = await import('./kontra.mock.js');
  return { default: { Sprite: mod.MockSprite, GameObject: mod.MockGameObject, init: mod.init } };
});

describe('Grenade behavior', () => {
  it('does not explode on first impact', () => {
    const canvas = document.createElement('canvas');
    canvas.width = 800;
    canvas.height = 600;
    const ctx = canvas.getContext('2d')!;
    const game = new Game(canvas, ctx);

    const grenade = new Grenade(100, 100, 0, 0, 5, 10, 20, 2);
    game.projectiles.push(grenade);
    game.currentTurnProjectiles.push(grenade);
    vi.spyOn(game.terrain, 'isColliding').mockReturnValue(true);

    game.update();

    expect(game.projectiles.length).toBe(1);
    expect(game.playerWurm.health).toBe(100);
  });

  it('bounces on terrain impact', () => {
    const canvas = document.createElement('canvas');
    canvas.width = 800;
    canvas.height = 600;
    const ctx = canvas.getContext('2d')!;
    const game = new Game(canvas, ctx);

    const grenade = new Grenade(100, 100, 0, 2, 5, 10, 20, 2);
    game.projectiles.push(grenade);
    game.currentTurnProjectiles.push(grenade);
    vi.spyOn(game.terrain, 'isColliding').mockReturnValue(true);

    game.update();

    expect(grenade.dy).toBe(-1);
  });

  it('explodes after fuse expires', () => {
    const canvas = document.createElement('canvas');
    canvas.width = 800;
    canvas.height = 600;
    const ctx = canvas.getContext('2d')!;
    const game = new Game(canvas, ctx);

    const grenade = new Grenade(100, 100, 0, 0, 5, 10, 20, 1);
    game.projectiles.push(grenade);
    game.currentTurnProjectiles.push(grenade);
    vi.spyOn(game.terrain, 'isColliding').mockReturnValue(false);
    const destroySpy = vi.spyOn(game.terrain, 'destroy');

    game.update();

    expect(game.projectiles.length).toBe(0);
    expect(destroySpy).toHaveBeenCalled();
  });
});
