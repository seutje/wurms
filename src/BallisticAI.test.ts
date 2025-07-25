import { describe, it, expect, vi } from 'vitest';
import { getAiAction } from './BallisticAI.js';
import { Wurm } from './Wurm.js';

vi.mock('kontra/kontra.mjs', async () => {
  const mod = await import('./kontra.mock.js');
  return { default: { Sprite: mod.MockSprite, GameObject: mod.MockGameObject, init: mod.init } };
});

describe('getAiAction ballistic firing', () => {
  it('aims left upwards when shooter is right of target', () => {
    const shooter = new Wurm(600, 550, 100, 'red');
    const target = new Wurm(200, 550, 100, 'blue');
    const { aiAngle } = getAiAction(shooter, target);
    expect(aiAngle).toBeGreaterThan(90);
    expect(aiAngle).toBeLessThan(180);
  });

  it('aims right upwards when shooter is left of target', () => {
    const shooter = new Wurm(200, 550, 100, 'red');
    const target = new Wurm(600, 550, 100, 'blue');
    const { aiAngle } = getAiAction(shooter, target);
    expect(aiAngle).toBeGreaterThan(0);
    expect(aiAngle).toBeLessThan(90);
  });
});
