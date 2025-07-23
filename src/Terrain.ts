import p5 from 'p5';

export class Terrain {
  private terrain: p5.Image;
  private p: p5;

  constructor(p: p5) {
    this.p = p;
    this.terrain = this.generateTerrain();
  }

  private generateTerrain(): p5.Image {
    const terrainImage = this.p.createImage(this.p.width, this.p.height);
    terrainImage.loadPixels();

    const noiseScale = 0.01;

    for (let x = 0; x < terrainImage.width; x++) {
      const noiseVal = this.p.noise(x * noiseScale);
      const y = this.p.map(noiseVal, 0, 1, this.p.height / 2, this.p.height);

      for (let j = y; j < this.p.height; j++) {
        terrainImage.set(x, j, this.p.color(139, 69, 19));
      }
    }

    terrainImage.updatePixels();
    return terrainImage;
  }

  public draw() {
    this.p.image(this.terrain, 0, 0);
  }

  public destroy(x: number, y: number, radius: number) {
    this.terrain.loadPixels();
    for (let i = x - radius; i < x + radius; i++) {
      for (let j = y - radius; j < y + radius; j++) {
        if (this.p.dist(i, j, x, y) < radius) {
          this.terrain.set(i, j, this.p.color(0, 0, 0, 0));
        }
      }
    }
    this.terrain.updatePixels();
  }

  public isColliding(pos: p5.Vector): boolean {
    const c = this.terrain.get(pos.x, pos.y);
    return this.p.alpha(c) !== 0;
  }
}
