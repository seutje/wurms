import { describe, it, expect, vi } from 'vitest';
import { Wurm } from '../Wurm.js';
import { calculateReward } from './RewardFunction.js';

vi.mock('kontra/kontra.mjs', () => ({
  default: {
    Sprite: class MockSprite {
      x: number;
      y: number;
      width: number;
      height: number;
      color: string;
      constructor(props: any) {
        this.x = props.x;
        this.y = props.y;
        this.width = props.width;
        this.height = props.height;
        this.color = props.color;
      }
    },
  },
}));

describe('calculateReward', () => {
  it('penalizes a missed shot every turn', () => {
    const player = new Wurm(0, 0, 100, 'red');
    const ai = new Wurm(0, 0, 100, 'blue');

    const reward = calculateReward(player, ai, false, false, false, false, 0);
    expect(reward).toBe(-1);
  });
});
