import { Wurm } from '../Wurm.js';

export interface Observation {
  /**
   * Normalized angle from the AI Wurm to the player Wurm in the range [-1, 1].
   */
  angleToTarget: number;
  /**
   * Normalized distance from the AI Wurm to the player Wurm in the range [0, 1].
   */
  distanceToTarget: number;
}

const MAX_DISTANCE = 1000;

// Note: "playerWurm" is the target and "aiWurm" is the observer.
// The observation describes the position of the target relative to the AI.
export function getObservation(playerWurm: Wurm, aiWurm: Wurm): Observation {
  const dx = playerWurm.x - aiWurm.x;
  const dy = playerWurm.y - aiWurm.y;
  const angleToTarget = (Math.atan2(dy, dx) * 180) / Math.PI;
  const distanceToTarget = Math.hypot(dx, dy);

  return {
    angleToTarget: angleToTarget / 180,
    distanceToTarget: Math.min(distanceToTarget, MAX_DISTANCE) / MAX_DISTANCE,
  };
}
