import { Wurm } from '../Wurm.js';

export interface Observation {
  angleToTarget: number;
  distanceToTarget: number;
}

export function getObservation(playerWurm: Wurm, aiWurm: Wurm): Observation {
  const dx = playerWurm.x - aiWurm.x;
  const dy = playerWurm.y - aiWurm.y;
  const angleToTarget = (Math.atan2(dy, dx) * 180) / Math.PI;
  const distanceToTarget = Math.hypot(dx, dy);

  return {
    angleToTarget,
    distanceToTarget,
  };
}
