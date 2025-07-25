import { describe, it, expect, vi } from 'vitest';
import { getAiAction, resetAiShotCount } from './BallisticAI.js';
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

  it('uses nukes after six shots', () => {
    resetAiShotCount();
    const shooter = new Wurm(200, 550, 100, 'red');
    const target = new Wurm(600, 550, 100, 'blue');
    let weapon = '';
    for (let i = 0; i < 6; i++) {
      weapon = getAiAction(shooter, target).aiWeapon;
    }
    expect(weapon).toBe('mortar');
    weapon = getAiAction(shooter, target).aiWeapon;
    expect(weapon).toBe('nuke');
  });

  it('misses less with each of the first three shots', () => {
    resetAiShotCount();
    const shooter = new Wurm(200, 550, 100, 'red');
    const target = new Wurm(600, 550, 100, 'blue');
    const angles: number[] = [];
    for (let i = 0; i < 4; i++) {
      angles.push(getAiAction(shooter, target).aiAngle);
    }
    const diff1 = Math.abs(angles[0] - angles[3]);
    const diff2 = Math.abs(angles[1] - angles[3]);
    const diff3 = Math.abs(angles[2] - angles[3]);
    expect(diff1).toBeGreaterThan(diff2);
    expect(diff2).toBeGreaterThan(diff3);
  });
});
