import { init, GameLoop, initPointer, onPointer } from 'kontra';
import { Terrain } from './Terrain';
import { Projectile } from './Projectile';

const { canvas } = init('game');
initPointer();

const terrain = new Terrain(canvas.width, canvas.height);
const projectiles: Projectile[] = [];

onPointer('down', (e, object) => {
  const projectile = new Projectile(
    e.x,
    e.y,
    (Math.random() * 10) - 5,
    (Math.random() * -5) - 5
  );
  projectiles.push(projectile);
});

const loop = GameLoop({
  update: () => {
    for (let i = projectiles.length - 1; i >= 0; i--) {
      const projectile = projectiles[i];
      projectile.update();

      if (terrain.isColliding(projectile.x, projectile.y)) {
        terrain.destroy(projectile.x, projectile.y, 50);
        projectiles.splice(i, 1);
      }
    }
  },
  render: () => {
    terrain.render();
    for (const projectile of projectiles) {
      projectile.render();
    }
  }
});

loop.start();
