declare module 'kontra' {
  export class GameObject {
    constructor(properties?: object);
    x: number;
    y: number;
    width: number;
    height: number;
    context: CanvasRenderingContext2D;
    init(properties?: object): void;
    update(): void;
    render(): void;
  }

  export class Sprite extends GameObject {
    dx: number;
    dy: number;
    ddx: number;
    ddy: number;
    ttl: number;
    rotation: number;
    anchor: { x: number; y: number };
    color: string;
    image: HTMLImageElement | HTMLCanvasElement;
    animations: object;
    advance(): void;
  }

  export function init(canvas: HTMLCanvasElement): void;
  export function GameLoop(properties: { update: Function; render: Function; }): any;
}