"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.calculateReward = calculateReward;
function calculateReward(playerWurm, aiWurm, hitEnemy, hitSelf, gameEnded, playerWon, aiWon) {
    var reward = 0;
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
    if (!hitEnemy && !hitSelf && gameEnded) { // Assuming gameEnded implies a turn ended without a hit
        reward -= 10;
    }
    // Small reward for getting closer to the enemy (this is harder to implement without previous state)
    // For now, I'll omit this and add it if needed later, as it requires tracking distance over turns.
    return reward;
}
