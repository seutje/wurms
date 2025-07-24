import { describe, it, expect } from 'vitest';
import { ReplayBuffer, Experience } from './ReplayBuffer.js';

const dummyObs = {
  angleToTarget: 0,
  distanceToTarget: 0,
};

describe('ReplayBuffer', () => {
  it('stores and samples experiences', () => {
    const buffer = new ReplayBuffer(5);
    for (let i = 0; i < 5; i++) {
      const exp: Experience = {
        observation: dummyObs,
        action: i,
        reward: i,
        nextObservation: dummyObs,
        done: false,
      };
      buffer.add(exp);
    }
    expect(buffer.size()).toBe(5);
    const sample = buffer.sample(3);
    expect(sample).toHaveLength(3);
  });
});
