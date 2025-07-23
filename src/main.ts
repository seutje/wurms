import { init, GameLoop, initPointer, onPointer } from 'kontra';
import { Terrain } from './Terrain';
import { Projectile } from './Projectile';
import { Wurm } from './Wurm';

const { canvas, context } = init('game');
initPointer();

const terrain = new Terrain(canvas.width, canvas.height);
const projectiles: Projectile[] = [];

// Game States
const GameState = {
  PLANNING: 'PLANNING',
  EXECUTION: 'EXECUTION',
  RESOLUTION: 'RESOLUTION',
};
let currentGameState = GameState.PLANNING;

// Wurms
const playerWurm = new Wurm(100, 100, 100, 'blue');
const aiWurm = new Wurm(canvas.width - 100, 100, 100, 'green');

// UI Elements
const weaponSelect = document.getElementById('weapon') as HTMLSelectElement;
const angleInput = document.getElementById('angle') as HTMLInputElement;
const angleValueSpan = document.getElementById('angle-value') as HTMLSpanElement;
const powerInput = document.getElementById('power') as HTMLInputElement;
const powerValueSpan = document.getElementById('power-value') as HTMLSpanElement;
const fireButton = document.getElementById('fire') as HTMLButtonElement;

// Update angle and power display
angleInput.addEventListener('input', () => {
  angleValueSpan.textContent = angleInput.value;
});
powerInput.addEventListener('input', () => {
  powerValueSpan.textContent = powerInput.value;
});

fireButton.addEventListener('click', () => {
  if (currentGameState === GameState.PLANNING) {
    const angle = parseFloat(angleInput.value);
    const power = parseFloat(powerInput.value);
    const weapon = weaponSelect.value;

    const { radius, damage } = weaponProperties[weapon];

    // Fire from player wurm's position
    const startX = playerWurm.x;
    const startY = playerWurm.y;

    // Convert angle and power to velocity components
    const radians = angle * Math.PI / 180;
    const velX = power * Math.cos(radians) * 0.1; // Scale down for reasonable speed
    const velY = power * Math.sin(radians) * -0.1; // Negative for upward movement

    const projectile = new Projectile(
      startX,
      startY,
      velX,
      velY,
      radius,
      damage
    );
    projectiles.push(projectile);

    currentGameState = GameState.EXECUTION;
  }
});

const loop = GameLoop({
  update: () => {
    switch (currentGameState) {
      case GameState.PLANNING:
        // Player is choosing actions
        break;
      case GameState.EXECUTION:
        // Projectiles are in flight
        let allProjectilesResolved = true;
        for (let i = projectiles.length - 1; i >= 0; i--) {
          const projectile = projectiles[i];
          projectile.update();

          // Check collision with terrain
          if (terrain.isColliding(projectile.x, projectile.y)) {
            terrain.destroy(projectile.x, projectile.y, projectile.radius);
            projectiles.splice(i, 1);
            // For now, a hit on terrain also means damage to nearby wurms
            // This will be refined later with explosion radius and damage falloff
            if (playerWurm.collidesWith(projectile)) {
              playerWurm.takeDamage(projectile.damage);
            }
            if (aiWurm.collidesWith(projectile)) {
              aiWurm.takeDamage(projectile.damage);
            }
          } else if (projectile.x < 0 || projectile.x > canvas.width || projectile.y > canvas.height) {
            // Remove projectiles that go off-screen
            projectiles.splice(i, 1);
          } else {
            allProjectilesResolved = false;
          }
        }

        if (allProjectilesResolved && projectiles.length === 0) {
          // Check win/loss conditions
          if (playerWurm.health <= 0 && aiWurm.health <= 0) {
            console.log("Draw!");
            currentGameState = GameState.GAME_OVER;
          } else if (playerWurm.health <= 0) {
            console.log("AI Wins!");
            currentGameState = GameState.GAME_OVER;
          } else if (aiWurm.health <= 0) {
            console.log("Player Wins!");
            currentGameState = GameState.GAME_OVER;
          } else {
            currentGameState = GameState.RESOLUTION;
          }
        }
        break;
      case GameState.RESOLUTION:
        // Evaluate game state, transition to next turn or PLANNING
        // For now, just transition back to planning after a short delay
        setTimeout(() => {
          currentGameState = GameState.PLANNING;
        }, 1000);
        break;
      case GameState.GAME_OVER:
        // Game has ended, stop updates or show game over screen
        break;
    }
  },
  render: () => {
    terrain.render();
    playerWurm.render();
    aiWurm.render();
    for (const projectile of projectiles) {
      projectile.render();
    }

    // Display health (for debugging/testing)
    context.fillStyle = 'white';
    context.font = '16px Arial';
    context.fillText(`Player Health: ${playerWurm.health}`, 10, 20);
    context.fillText(`AI Health: ${aiWurm.health}`, canvas.width - 150, 20);
  }
});

loop.start();
