import { Wurm } from '../Wurm.js';

export interface Observation {
  playerWurmX: number;
  playerWurmY: number;
  aiWurmX: number;
  aiWurmY: number;
}

export function getObservation(playerWurm: Wurm, aiWurm: Wurm): Observation {
  return {
    playerWurmX: playerWurm.x,
    playerWurmY: playerWurm.y,
    aiWurmX: aiWurm.x,
    aiWurmY: aiWurm.y,
  };
}
