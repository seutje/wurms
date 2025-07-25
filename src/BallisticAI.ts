import { Wurm } from './Wurm.js';

let shotCount = 0;

export function resetAiShotCount() {
  shotCount = 0;
}

export function getAiAction(shooter: Wurm, target: Wurm) {
  const g = 0.1;
  const power = 60;
  const v = power * 0.15;

  const shooterX = shooter.x + shooter.width / 2;
  const shooterY = shooter.y;
  const targetX = target.x + target.width / 2;
  const targetY = target.y;

  const dx = targetX - shooterX;
  const dy = shooterY - targetY;
  const dxAbs = Math.abs(dx);

  let angleRad: number;
  if (dxAbs === 0) {
    angleRad = Math.PI / 2;
  } else {
    const discriminant = v ** 4 - g * (g * dxAbs ** 2 + 2 * dy * v ** 2);
    if (discriminant <= 0) {
      angleRad = Math.PI / 4;
    } else {
      angleRad = Math.atan((v ** 2 + Math.sqrt(discriminant)) / (g * dxAbs));
    }
  }

  let angleDeg = (angleRad * 180) / Math.PI;
  if (dx < 0) {
    angleDeg = 180 - angleDeg;
  }

  shotCount += 1;

  const missOffsets = [45, 20, 5];
  if (shotCount <= missOffsets.length) {
    const offset = missOffsets[shotCount - 1];
    if (dx > 0) {
      angleDeg = Math.max(0, angleDeg - offset);
    } else {
      angleDeg = Math.min(180, angleDeg + offset);
    }
  }

  const aiWeapon = shotCount > 6 ? 'nuke' : 'mortar';

  return { aiWeapon, aiAngle: angleDeg, aiPower: power };
}
