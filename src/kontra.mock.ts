export class MockGameObject {
  x: number;
  y: number;
  width: number;
  height: number;
  context: any; // Mock context

  constructor(properties: any) {
    this.x = properties.x || 0;
    this.y = properties.y || 0;
    this.width = properties.width || 0;
    this.height = properties.height || 0;
    this.context = {
      drawImage: () => {}, // Mock drawImage
      fillStyle: '',
      fillRect: () => {},
      getImageData: () => ({ data: [0, 0, 0, 0] }), // Mock getImageData
      globalCompositeOperation: '',
      beginPath: () => {},
      arc: () => {},
      fill: () => {},
    };
  }
  update() {}
  render() {}
}

export class MockSprite extends MockGameObject {
  dx: number;
  dy: number;

  constructor(properties: any) {
    super(properties);
    this.dx = properties.dx || 0;
    this.dy = properties.dy || 0;
  }

  advance() {
    this.x += this.dx;
    this.y += this.dy;
  }
}

export function init(_canvas: HTMLCanvasElement) {
  // Mock init function
}
