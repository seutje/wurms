import { Projectile } from './Projectile.js';
import { Wurm } from './Wurm.js';
import { Terrain } from './Terrain.js';

export function handleProjectileWurmCollision(
  projectile: Projectile,
  wurm: Wurm,
  terrain: Terrain
): boolean {
  if (wurm.collidesWith(projectile)) {
    wurm.takeDamage(projectile.damage);
    terrain.destroy(projectile.x, projectile.y, projectile.explosionRadius);
    return true;
  }
  return false;
}
