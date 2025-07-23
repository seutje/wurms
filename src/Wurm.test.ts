import { describe, it, expect, vi } from 'vitest';
import { Wurm } from './Wurm';

// Mock the Sprite class from Kontra.js
vi.mock('kontra', () => ({
  Sprite: class MockSprite {
    x: number;
    y: number;
    width: number;
    height: number;
    color: string;
    constructor(properties: any) {
      this.x = properties.x;
      this.y = properties.y;
      this.width = properties.width;
      this.height = properties.height;
      this.color = properties.color;
    }
    // Mock collidesWith method for testing
    collidesWith(obj: any) {
      return false; // Simplified for now
    }
  },
}));

describe('Wurm', () => {
  it('should take damage correctly', () => {
    const wurm = new Wurm(0, 0, 100, 'red');
    expect(wurm.health).toBe(100);
    wurm.takeDamage(20);
    expect(wurm.health).toBe(80);
  });

  it('should not have negative health', () => {
    const wurm = new Wurm(0, 0, 10, 'red');
    wurm.takeDamage(20);
    expect(wurm.health).toBe(0);
  });
});