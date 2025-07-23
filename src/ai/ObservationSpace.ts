import { Wurm } from '../Wurm';
import { Terrain } from '../Terrain';

export interface Observation {
  playerWurmX: number;
  playerWurmY: number;
  playerWurmHealth: number;
  aiWurmX: number;
  aiWurmY: number;
  aiWurmHealth: number;
  // Simplified terrain representation (e.g., heights at intervals)
  terrainHeights: number[];
}

export function getObservation(playerWurm: Wurm, aiWurm: Wurm, terrain: Terrain): Observation {
  const terrainHeights: number[] = [];
  // Sample terrain heights at regular intervals
  const interval = 20; // Sample every 20 pixels
  for (let x = 0; x < terrain.width; x += interval) {
    // Find the highest point of the terrain at this x-coordinate
    let highestY = terrain.height;
    for (let y = 0; y < terrain.height; y++) {
      if (terrain.isColliding(x, y)) {
        highestY = y;
        break;
      }
    }
    terrainHeights.push(highestY);
  }

  return {
    playerWurmX: playerWurm.x,
    playerWurmY: playerWurm.y,
    playerWurmHealth: playerWurm.health,
    aiWurmX: aiWurm.x,
    aiWurmY: aiWurm.y,
    aiWurmHealth: aiWurm.health,
    terrainHeights,
  };
}
