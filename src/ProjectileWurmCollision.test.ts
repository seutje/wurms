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
  it('damages wurm when projectile collides', () => {
    const wurm = new Wurm(0, 0, 100, 'blue');
    const projectile = new Projectile(0, 0, 0, 0, 5, 20, 10);
    const result = handleProjectileWurmCollision(projectile, wurm);
    expect(result).toBe(true);
    expect(wurm.health).toBe(80);
  });

  it('returns false when no collision occurs', () => {
    const wurm = new Wurm(100, 100, 100, 'blue');
    const projectile = new Projectile(0, 0, 0, 0, 5, 20, 10);
    const result = handleProjectileWurmCollision(projectile, wurm);
    expect(result).toBe(false);
    expect(wurm.health).toBe(100);
  });
});
