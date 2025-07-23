import { Projectile } from './Projectile.js';
import { Wurm } from './Wurm.js';

export function handleProjectileWurmCollision(projectile: Projectile, wurm: Wurm): boolean {
  if (wurm.collidesWith(projectile)) {
    wurm.takeDamage(projectile.damage);
    return true;
  }
  return false;
}
