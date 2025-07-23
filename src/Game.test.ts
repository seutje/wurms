import { describe, it, expect, vi } from 'vitest';
import { Game } from './Game.js';
import { Wurm } from './Wurm.js';

vi.mock('kontra/kontra.mjs', () => ({
  default: {
    Sprite: class MockSprite {
      x: number;
      y: number;
      width: number;
      height: number;
      dx: number;
      dy: number;
      color: string;
      context: any;
      constructor(props: any) {
        Object.assign(this, props);
        this.dx = props.dx || 0;
        this.dy = props.dy || 0;
        this.context = props.context || {
          drawImage: () => {},
          fillStyle: '',
          fillRect: () => {},
          getImageData: () => ({ data: [0, 0, 0, 0] }),
          globalCompositeOperation: '',
          beginPath: () => {},
          arc: () => {},
          fill: () => {},
        };
      }
      advance() {
        this.x += this.dx;
        this.y += this.dy;
      }
    },
    GameObject: class MockGameObject {
      x: number;
      y: number;
      width: number;
      height: number;
      context: any;
      constructor(props: any) {
        Object.assign(this, props);
        this.context = props.context || {
          drawImage: () => {},
          fillStyle: '',
          fillRect: () => {},
          getImageData: () => ({ data: [0, 0, 0, 0] }),
          globalCompositeOperation: '',
          beginPath: () => {},
          arc: () => {},
          fill: () => {},
        };
      }
    },
    init: () => {},
  }
}));

describe('Game.fire', () => {
  it('spawns projectile outside the firing wurm', () => {
    const canvas = document.createElement('canvas');
    canvas.width = 200;
    canvas.height = 200;
    const context = canvas.getContext('2d') as CanvasRenderingContext2D;
    const game = new Game(canvas, context);

    const projectile = game.fire(game.playerWurm, 'bazooka', 45, 50);

    expect(game.playerWurm.collidesWith(projectile)).toBe(false);
  });
});
