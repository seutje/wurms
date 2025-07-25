import { Wurm } from '../Wurm.js';

export interface Observation {
  angleToTarget: number;
  distanceToTarget: number;
}

// Note: "playerWurm" is the target and "aiWurm" is the observer.
// The observation describes the position of the target relative to the AI.
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
