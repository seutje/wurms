import { Wurm } from '../Wurm.js';

export function calculateReward(
  _playerWurm: Wurm,
  _aiWurm: Wurm,
  hitEnemy: boolean,
  hitSelf: boolean,
  playerWon: boolean,
  aiWon: boolean,
  distanceDelta: number
): number {
  let reward = 0;

  // Large reward for winning the game
  if (aiWon) {
    reward += 1000;
  }
  // Large negative reward for losing the game
  if (playerWon) {
    reward -= 1000;
  }

  // Medium reward for hitting the enemy wurm
  if (hitEnemy) {
    reward += 100;
  }
  // Medium negative reward for taking damage (from enemy)
  if (hitSelf) {
    reward -= 50;
  }

  // Small negative reward for missing a shot (if no hit occurred)
  if (!hitEnemy && !hitSelf) {
    reward -= 10;
  }

  // Encourage getting closer to the enemy
  if (distanceDelta < 0) {
    reward += 1;
  } else if (distanceDelta > 0) {
    reward -= 1;
  }

  return reward;
}
