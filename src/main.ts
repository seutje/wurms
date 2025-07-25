// Import kontra from its ESM build for compatibility with both browser and Node
import kontra from 'kontra/kontra.mjs';
const { init, GameLoop } = kontra;
import { Wurm } from './Wurm.js';
import { Game } from './Game.js';

import { SoundManager } from './SoundManager.js';
import { setupKeyboardControls } from './KeyboardControls.js';

// Sound Manager
const soundManager = new SoundManager();
soundManager.createTone('fire', 440, 0.2);
soundManager.createNoise('explosion', 0.6);
soundManager.createSquareTone('damage', 440, 0.2);
soundManager.createTone('click', 660, 0.05);

// Get screen elements
const startScreen = document.getElementById('start-screen') as HTMLElement;
const gameScreen = document.getElementById('game-screen') as HTMLElement;
const gameOverScreen = document.getElementById('game-over-screen') as HTMLElement;
const gameOverMessage = document.getElementById('game-over-message') as HTMLElement;
const startGameButton = document.getElementById('start-game-button') as HTMLButtonElement;
const playAgainButton = document.getElementById('play-again-button') as HTMLButtonElement;

const seedParam = new URLSearchParams(window.location.search).get('seed');
const urlSeed = seedParam ? parseInt(seedParam, 10) : undefined;

function getAiAction(shooter: Wurm, target: Wurm) {
  const g = 0.1;
  const power = 60;
  const v = power * 0.15;

  const shooterX = shooter.x + shooter.width / 2;
  const shooterY = shooter.y;
  const targetX = target.x + target.width / 2;
  const targetY = target.y;

  const dx = targetX - shooterX;
  const dy = shooterY - targetY;

  let angleRad: number;
  if (dx === 0) {
    angleRad = Math.PI / 2;
  } else {
    const discriminant = v ** 4 - g * (g * dx ** 2 + 2 * dy * v ** 2);
    if (discriminant <= 0) {
      angleRad = Math.PI / 4;
    } else {
      angleRad = Math.atan((v ** 2 + Math.sqrt(discriminant)) / (g * dx));
    }
  }

  let angleDeg = (angleRad * 180) / Math.PI;
  if (dx < 0) {
    angleDeg = 180 - angleDeg;
  }

  return { aiWeapon: 'mortar', aiAngle: angleDeg, aiPower: power };
}



// Main Game Initialization and Loop
let mainGameLoop: any;

function startGame(seed?: number, playerIsAI = false, showUI = true) {
  const canvas = document.getElementById('game') as HTMLCanvasElement;
  const context = canvas.getContext('2d') as CanvasRenderingContext2D;

  canvas.width = 800;
  canvas.height = 600;

  const game = new Game(canvas, context, seed);

  window.addEventListener('resize', () => {
    canvas.width = 800;
    canvas.height = 600;
    init(canvas);
  });

  // Game States
  const GameState = {
    PLANNING: 'PLANNING',
    EXECUTION: 'EXECUTION',
    RESOLUTION: 'RESOLUTION',
    GAME_OVER: 'GAME_OVER',
  };
  let currentGameState = GameState.PLANNING;
  let whoseTurn: 'player' | 'ai' = 'player';

  const initialAngleInput = document.getElementById('angle') as HTMLInputElement;
  game.playerWurm.barrelAngle = 180 - parseFloat(initialAngleInput.value);



  // UI Elements
  const weaponSelect = document.getElementById('weapon') as HTMLSelectElement;
  const angleInput = document.getElementById('angle') as HTMLInputElement;
  const angleValueSpan = document.getElementById('angle-value') as HTMLSpanElement;
  const powerInput = document.getElementById('power') as HTMLInputElement;
  const powerValueSpan = document.getElementById('power-value') as HTMLSpanElement;
  const fireButton = document.getElementById('fire') as HTMLButtonElement;

  angleValueSpan.textContent = (180 - parseFloat(angleInput.value)).toString();

  let removeKeyboard = () => {};

  if (showUI && !playerIsAI) {
    // Update angle and power display
    angleInput.addEventListener('input', () => {
      const angle = 180 - parseFloat(angleInput.value);
      angleValueSpan.textContent = angle.toString();
      game.playerWurm.barrelAngle = angle;
    });
    powerInput.addEventListener('input', () => {
      powerValueSpan.textContent = powerInput.value;
    });

    fireButton.addEventListener('click', () => {
      if (currentGameState === GameState.PLANNING) {
        soundManager.playSound('click');
        const angle = 180 - parseFloat(angleInput.value);
        const power = parseFloat(powerInput.value);
        const weapon = weaponSelect.value;

        game.fire(game.playerWurm, weapon, angle, power);
        soundManager.playSound('fire');

        currentGameState = GameState.EXECUTION;
        whoseTurn = 'ai';
      }
    });

    removeKeyboard = setupKeyboardControls({
      angleInput,
      powerInput,
      fireButton,
      isPlanning: () => currentGameState === GameState.PLANNING && whoseTurn === 'player',
    });
  }

  mainGameLoop = GameLoop({
    blur: true,
    update: () => {
      game.playerWurm.update(game.terrain);
      game.aiWurm.update(game.terrain);

      const prevPlayer = game.playerWurm.health;
      const prevAi = game.aiWurm.health;

      game.update();

      switch (currentGameState) {
        case GameState.PLANNING:
          if (playerIsAI && whoseTurn === 'player') {
            const { aiWeapon, aiAngle, aiPower } = getAiAction(
              game.playerWurm,
              game.aiWurm
            );
            game.fire(game.playerWurm, aiWeapon, aiAngle, aiPower);
            soundManager.playSound('fire');
            currentGameState = GameState.EXECUTION;
            whoseTurn = 'ai';
          }
          break;
        case GameState.EXECUTION:
          if (game.playerWurm.health < prevPlayer || game.aiWurm.health < prevAi) {
            soundManager.playSound('explosion');
            soundManager.playSound('damage');
          }

          if (game.currentTurnProjectiles.length === 0) { // Only transition when current turn's projectiles are resolved
            // Check win/loss conditions
            if (game.playerWurm.health <= 0 && game.aiWurm.health <= 0) {
              gameOverMessage.textContent = "Draw!";
              currentGameState = GameState.GAME_OVER;
            } else if (game.playerWurm.health <= 0) {
              gameOverMessage.textContent = "AI Wins!";
              currentGameState = GameState.GAME_OVER;
            } else if (game.aiWurm.health <= 0) {
              gameOverMessage.textContent = "Player Wins!";
              currentGameState = GameState.GAME_OVER;
            } else {
              if (whoseTurn === 'ai') {
                currentGameState = GameState.RESOLUTION;
              } else {
                currentGameState = GameState.PLANNING;
              }
            }
          }
          break;
        case GameState.RESOLUTION:
          const { aiWeapon, aiAngle, aiPower } = getAiAction(
            game.aiWurm,
            game.playerWurm
          );
          game.fire(game.aiWurm, aiWeapon, aiAngle, aiPower);
          soundManager.playSound('fire');

          currentGameState = GameState.EXECUTION; // AI fires, so back to execution
          whoseTurn = 'player';
          break;
        case GameState.GAME_OVER:
          if (showUI) {
            gameScreen.style.display = 'none';
            gameOverScreen.style.display = 'flex';
            mainGameLoop.stop();
            removeKeyboard();
          } else {
            game.reset();
            currentGameState = GameState.PLANNING;
            whoseTurn = 'player';
          }
          break;
      }
    },
    render: () => {
      game.draw();

      // Display health (for debugging/testing)
      context.fillStyle = 'white';
      context.font = '16px Arial';
      context.fillText(`Player Health: ${game.playerWurm.health}`, 10, 20);
      context.fillText(`AI Health: ${game.aiWurm.health}`, canvas.width - 150, 20);
    }
  } as any);

  mainGameLoop.start();
}

startGameButton.addEventListener('click', () => {
  soundManager.unlock();
  soundManager.playSound('click');
  startScreen.style.display = 'none';
  gameScreen.style.display = 'block';
  if (mainGameLoop) {
    mainGameLoop.stop();
  }
  startGame(urlSeed, false, true);
});

playAgainButton.addEventListener('click', () => {
  gameOverScreen.style.display = 'none';
  startScreen.style.display = 'flex';
  soundManager.unlock();
  soundManager.playSound('click');
  if (mainGameLoop) {
    mainGameLoop.stop();
  }
  startGame(urlSeed, true, false);
});

startGame(urlSeed, true, false);

