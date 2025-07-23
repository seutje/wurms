// Import kontra from its ESM build for compatibility with both browser and Node
import kontra from 'kontra/kontra.mjs';
const { init, GameLoop } = kontra;
import { Terrain } from './Terrain.js';
import { Projectile } from './Projectile.js';
import { Wurm } from './Wurm.js';
import { DQNModel } from './ai/DQNModel.js';
import { getObservation } from './ai/ObservationSpace.js';
import { WEAPON_CHOICES } from './ai/ActionSpace.js';
import { weaponProperties } from './WeaponProperties.js';
import { SoundManager } from './SoundManager.js';

// Sound Manager
const soundManager = new SoundManager();
soundManager.loadSound('fire', './sounds/fire.wav');
soundManager.loadSound('explosion', './sounds/explosion.wav');
soundManager.loadSound('damage', './sounds/damage.wav');
soundManager.loadSound('click', './sounds/click.wav');

// Get screen elements
const startScreen = document.getElementById('start-screen') as HTMLElement;
const gameScreen = document.getElementById('game-screen') as HTMLElement;
const gameOverScreen = document.getElementById('game-over-screen') as HTMLElement;
const gameOverMessage = document.getElementById('game-over-message') as HTMLElement;
const startGameButton = document.getElementById('start-game-button') as HTMLButtonElement;
const playAgainButton = document.getElementById('play-again-button') as HTMLButtonElement;



// Main Game Initialization and Loop
let mainGameLoop: any;

function startGame() {
  // Initialize Kontra for the main game canvas
  const canvas = document.getElementById('game') as HTMLCanvasElement;
  const context = canvas.getContext('2d') as CanvasRenderingContext2D;

  // Set initial canvas size
  canvas.width = window.innerWidth;
  canvas.height = window.innerHeight;

  init(canvas);

  const terrain = new Terrain(canvas.width, canvas.height, context);

  // Handle window resize
  window.addEventListener('resize', () => {
    canvas.width = window.innerWidth;
    canvas.height = window.innerHeight;
    init(canvas); // Re-initialize Kontra with new canvas size
  });
  const projectiles: Projectile[] = [];
  let currentTurnProjectiles: Projectile[] = [];

  // Game States
  const GameState = {
    PLANNING: 'PLANNING',
    EXECUTION: 'EXECUTION',
    RESOLUTION: 'RESOLUTION',
    GAME_OVER: 'GAME_OVER',
  };
  let currentGameState = GameState.PLANNING;
  let whoseTurn: 'player' | 'ai' = 'player';

  // Wurms
  const playerWurm = new Wurm(100, terrain.getGroundHeight(100), 100, 'blue');
  const aiWurm = new Wurm(canvas.width - 100, terrain.getGroundHeight(canvas.width - 100), 100, 'green');

  // AI Model
  let aiModel: DQNModel | null = null;
  

  async function loadModel() {
    try {
      aiModel = await DQNModel.load('/src/models/dqn-model');
      console.log('AI Model loaded successfully.');
    } catch (error) {
      console.warn('Could not load AI model, using random AI.', error);
      // Fallback to random AI if model not found
    }
  }
  loadModel();

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
      soundManager.playSound('click');
      const angle = parseFloat(angleInput.value);
      const power = parseFloat(powerInput.value);
      const weapon = weaponSelect.value;

      const { radius, damage } = weaponProperties[weapon];

      // Fire from player wurm's position
      const startX = playerWurm.x;
      const startY = playerWurm.y;

      // Convert angle and power to velocity components
      const radians = angle * Math.PI / 180;
      const velX = power * Math.cos(radians) * 0.15; // Scale down for reasonable speed
      const velY = power * Math.sin(radians) * -0.15; // Negative for upward movement

      const projectile = new Projectile(
        startX,
        startY,
        velX,
        velY,
        radius,
        damage
      );
      projectiles.push(projectile);
      currentTurnProjectiles.push(projectile);
      soundManager.playSound('fire');

      currentGameState = GameState.EXECUTION;
      whoseTurn = 'ai';
    }
  });

  mainGameLoop = GameLoop({
    update: () => {
      switch (currentGameState) {
        case GameState.PLANNING:
          // Player is choosing actions
          break;
        case GameState.EXECUTION:
          // Projectiles are in flight
          
          for (let i = projectiles.length - 1; i >= 0; i--) {
            const projectile = projectiles[i];
            projectile.update();

            // Check collision with terrain
            if (terrain.isColliding(projectile.x + projectile.radius, projectile.y + projectile.radius)) {
              terrain.destroy(projectile.x + projectile.radius, projectile.y + projectile.radius, projectile.radius);
              projectiles.splice(i, 1);
              // Remove from currentTurnProjectiles if it was one of them
              const indexInCurrentTurn = currentTurnProjectiles.indexOf(projectile);
              if (indexInCurrentTurn > -1) {
                currentTurnProjectiles.splice(indexInCurrentTurn, 1);
              }
              soundManager.playSound('explosion');
              // For now, a hit on terrain also means damage to nearby wurms
              // This will be refined later with explosion radius and damage falloff
              if (playerWurm.collidesWith(projectile)) {
                playerWurm.takeDamage(projectile.damage);
                soundManager.playSound('damage');
              }
              if (aiWurm.collidesWith(projectile)) {
                aiWurm.takeDamage(projectile.damage);
                soundManager.playSound('damage');
              }
            } else if (projectile.x + (projectile.radius * 2) < 0 || projectile.x > canvas.width || projectile.y + (projectile.radius * 2) < 0 || projectile.y > canvas.height) {
              console.log(`Projectile removed: Off-screen at x: ${projectile.x}, y: ${projectile.y}, radius: ${projectile.radius}`);
              // Remove projectiles that go off-screen
              projectiles.splice(i, 1);
              // Remove from currentTurnProjectiles if it was one of them
              const indexInCurrentTurn = currentTurnProjectiles.indexOf(projectile);
              if (indexInCurrentTurn > -1) {
                currentTurnProjectiles.splice(indexInCurrentTurn, 1);
              }
            }
          }

          if (currentTurnProjectiles.length === 0) { // Only transition when current turn's projectiles are resolved
            // Check win/loss conditions
            if (playerWurm.health <= 0 && aiWurm.health <= 0) {
              gameOverMessage.textContent = "Draw!";
              currentGameState = GameState.GAME_OVER;
            } else if (playerWurm.health <= 0) {
              gameOverMessage.textContent = "AI Wins!";
              currentGameState = GameState.GAME_OVER;
            } else if (aiWurm.health <= 0) {
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
          // AI takes its turn
          let aiAngle: number;
          let aiPower: number;
          let aiWeapon: string;

          if (aiModel) {
            const observation = getObservation(aiWurm, playerWurm, terrain); // AI observes from its perspective
            const prediction = aiModel.predict(observation);
            const actionIndex = prediction.argMax(-1).dataSync()[0];

            const weaponIndex = Math.floor(actionIndex / (10 * 10));
            const angleBin = Math.floor((actionIndex % 100) / 10);
            const powerBin = actionIndex % 10;

            aiWeapon = WEAPON_CHOICES[weaponIndex];
            aiAngle = angleBin * 18; // 0-180 in 10 bins
            aiPower = powerBin * 10; // 0-100 in 10 bins
          } else {
            // Random AI fallback
            aiAngle = Math.random() * 180;
            aiPower = Math.random() * 100;
            const aiWeaponOptions = Object.keys(weaponProperties);
            aiWeapon = aiWeaponOptions[Math.floor(Math.random() * aiWeaponOptions.length)];
          }

          const { radius: aiRadius, damage: aiDamage } = weaponProperties[aiWeapon];

          const aiStartX = aiWurm.x;
          const aiStartY = aiWurm.y - 10; // Spawn slightly above the wurm

          const aiRadians = aiAngle * Math.PI / 180;
          const aiVelX = aiPower * Math.cos(aiRadians) * 0.15;
          const aiVelY = aiPower * Math.sin(aiRadians) * -0.15;

          const aiProjectile = new Projectile(
            aiStartX,
            aiStartY,
            aiVelX,
            aiVelY,
            aiRadius,
            aiDamage
          );
          projectiles.push(aiProjectile);
          currentTurnProjectiles.push(aiProjectile);
          soundManager.playSound('fire');

          currentGameState = GameState.EXECUTION; // AI fires, so back to execution
          whoseTurn = 'player';
          break;
        case GameState.GAME_OVER:
          gameScreen.style.display = 'none';
          gameOverScreen.style.display = 'flex';
          mainGameLoop.stop(); // Stop the main game loop
          break;
      }
    },
    render: () => {
      terrain.draw();

      playerWurm.draw();
      aiWurm.draw();
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

  mainGameLoop.start();
}

// AI vs AI Demo Loop
const aiDemoCanvasContainer = document.getElementById('ai-demo-canvas-container') as HTMLElement;
const aiDemoCanvas = document.createElement('canvas');
aiDemoCanvas.width = 400;
aiDemoCanvas.height = 300;
aiDemoCanvasContainer.appendChild(aiDemoCanvas);

init(aiDemoCanvas);

const aiDemoTerrain = new Terrain(aiDemoCanvas.width, aiDemoCanvas.height, aiDemoCanvas.getContext('2d')!);
const aiDemoWurm1 = new Wurm(50, aiDemoTerrain.getGroundHeight(50), 100, 'red');
const aiDemoWurm2 = new Wurm(aiDemoCanvas.width - 50, aiDemoTerrain.getGroundHeight(aiDemoCanvas.width - 50), 100, 'yellow');
const aiDemoProjectiles: Projectile[] = [];

const aiDemoLoop = GameLoop({
  update: () => {
    // Simplified AI logic for demo
    if (aiDemoProjectiles.length === 0) {
      const aiAngle = Math.random() * 180;
      const aiPower = Math.random() * 100;
      const aiWeaponOptions = Object.keys(weaponProperties);
      const aiWeapon = aiWeaponOptions[Math.floor(Math.random() * aiWeaponOptions.length)];

      const { radius, damage } = weaponProperties[aiWeapon];

      const startX = aiDemoWurm1.x;
      const startY = aiDemoWurm1.y;

      const radians = aiAngle * Math.PI / 180;
      const velX = aiPower * Math.cos(radians) * 0.15;
      const velY = aiPower * Math.sin(radians) * -0.15;

      const projectile = new Projectile(
        startX,
        startY,
        velX,
        velY,
        radius,
        damage
      );
      aiDemoProjectiles.push(projectile);
      soundManager.playSound('fire');
    }

    for (let i = aiDemoProjectiles.length - 1; i >= 0; i--) {
      const projectile = aiDemoProjectiles[i];
      projectile.update();

      if (aiDemoTerrain.isColliding(projectile.x + projectile.radius, projectile.y + projectile.radius)) {
        console.log(`AI Demo Projectile removed: Terrain collision at x: ${projectile.x}, y: ${projectile.y}, radius: ${projectile.radius}`);
        aiDemoTerrain.destroy(projectile.x + projectile.radius, projectile.y + projectile.radius, projectile.radius);
        aiDemoProjectiles.splice(i, 1);
        soundManager.playSound('explosion');
      } else if (projectile.x + (projectile.radius * 2) < 0 || projectile.x > aiDemoCanvas.width || projectile.y + (projectile.radius * 2) < 0 || projectile.y > aiDemoCanvas.height) {
        aiDemoProjectiles.splice(i, 1);
      }
    }
  },
  render: () => {
    aiDemoTerrain.draw();

    aiDemoWurm1.draw();
    aiDemoWurm2.draw();
    for (const projectile of aiDemoProjectiles) {
      projectile.render();
    }
  }
});

// Start Game Button
startGameButton.addEventListener('click', () => {
  startScreen.style.display = 'none';
  gameScreen.style.display = 'block';
  aiDemoLoop.stop(); // Stop AI demo when game starts
  startGame(); // Start main game loop
});

// Play Again Button
playAgainButton.addEventListener('click', () => {
  gameOverScreen.style.display = 'none';
  startScreen.style.display = 'flex';
  aiDemoLoop.start(); // Restart AI demo
});

aiDemoLoop.start(); // Start AI demo loop initially



