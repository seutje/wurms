import { describe, it, expect, vi } from 'vitest';
import { Terrain } from './Terrain.js';

vi.mock('kontra/kontra.mjs', async () => {
  const mod = await import('./kontra.mock.js');
  return { default: { GameObject: mod.MockGameObject, Sprite: mod.MockSprite, init: mod.init } };
});

describe('Terrain seed behavior', () => {
  it('produces the same terrain with the same seed', () => {
    const canvas = document.createElement('canvas');
    const ctx = canvas.getContext('2d')!;
    const t1 = new Terrain(100, 100, ctx, 42);
    const t2 = new Terrain(100, 100, ctx, 42);
    expect(t1.getGroundHeight(50)).toBe(t2.getGroundHeight(50));
  });

  it('produces different terrain with different seeds', () => {
    const canvas = document.createElement('canvas');
    const ctx = canvas.getContext('2d')!;
    const t1 = new Terrain(100, 100, ctx, 1);
    const t2 = new Terrain(100, 100, ctx, 2);
    expect(t1.getGroundHeight(50)).not.toBe(t2.getGroundHeight(50));
  });
});
