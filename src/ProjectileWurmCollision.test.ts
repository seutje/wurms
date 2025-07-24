import { describe, it, expect, vi } from 'vitest';
import { Wurm } from './Wurm.js';
import { Projectile } from './Projectile.js';
import { handleProjectileWurmCollision } from './collision.js';

vi.mock('kontra/kontra.mjs', () => ({
  default: {
    Sprite: class MockSprite {
      x: number;
      y: number;
      dx: number;
      dy: number;
      width: number;
      height: number;
      color: string;
      ddy: number;
      constructor(properties: any) {
        Object.assign(this, properties);
      }
      advance() {}
    },
  },
}));

describe('handleProjectileWurmCollision', () => {
  it('damages wurm and destroys terrain when projectile collides', () => {
    const wurm = new Wurm(0, 10, 100, 'blue');
    const projectile = new Projectile(0, 0, 0, 0, 5, 20, 10, 0);
    const terrain = { destroy: vi.fn() } as any;
    const result = handleProjectileWurmCollision(projectile, wurm, terrain);
    expect(result).toBe(true);
    expect(wurm.health).toBe(80);
    expect(terrain.destroy).toHaveBeenCalledWith(0, 0, 10);
  });

  it('returns false when no collision occurs', () => {
    const wurm = new Wurm(100, 100, 100, 'blue');
    const projectile = new Projectile(0, 0, 0, 0, 5, 20, 10, 0);
    const terrain = { destroy: vi.fn() } as any;
    const result = handleProjectileWurmCollision(projectile, wurm, terrain);
    expect(result).toBe(false);
    expect(wurm.health).toBe(100);
    expect(terrain.destroy).not.toHaveBeenCalled();
  });
});
