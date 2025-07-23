import p5 from 'p5';
import { Terrain } from './Terrain';
import { Projectile } from './Projectile';

const sketch = (p: p5) => {
  let terrain: Terrain;
  const projectiles: Projectile[] = [];

  p.setup = () => {
    p.createCanvas(p.windowWidth, p.windowHeight);
    terrain = new Terrain(p);
  };

  p.draw = () => {
    p.background(0);
    terrain.draw();

    for (let i = projectiles.length - 1; i >= 0; i--) {
      const projectile = projectiles[i];
      projectile.update();
      projectile.draw();

      if (terrain.isColliding(projectile.getPosition())) {
        terrain.destroy(projectile.getPosition().x, projectile.getPosition().y, 50);
        projectiles.splice(i, 1);
      }
    }
  };

  p.mousePressed = () => {
    const projectile = new Projectile(
      p,
      p.createVector(p.mouseX, p.mouseY),
      p.createVector(p.random(-5, 5), p.random(-5, -10))
    );
    projectiles.push(projectile);
  };
};

new p5(sketch);
