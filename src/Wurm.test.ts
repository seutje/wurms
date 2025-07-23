import { describe, it, expect, vi } from 'vitest';
import { Wurm } from './Wurm.js';

// Mock the Sprite class from Kontra.js
// Mock the kontra ESM build used in the source files
vi.mock('kontra/kontra.mjs', () => ({
  default: {
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
      collidesWith(_obj: any) {
        return false; // Simplified for now
      }
    },
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

  it('falls when terrain below is absent', () => {
    const wurm = new Wurm(0, 20, 100, 'red');
    const terrain = { isColliding: vi.fn().mockReturnValue(false) } as any;
    wurm.update(terrain);
    expect(wurm.y).toBeGreaterThan(0);
  });

  it('does not fall when terrain supports it', () => {
    const wurm = new Wurm(0, 20, 100, 'red');
    const terrain = { isColliding: vi.fn().mockReturnValue(true) } as any;
    wurm.update(terrain);
    expect(wurm.y).toBe(0);
  });
});