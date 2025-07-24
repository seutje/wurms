// Import kontra from its ESM build for compatibility with both browser and Node
import kontra from 'kontra/kontra.mjs';
const { init, GameLoop } = kontra;
import { Terrain } from './Terrain.js';
import { Projectile } from './Projectile.js';
import { Wurm } from './Wurm.js';
import { Game } from './Game.js';
import { DQNModel } from './ai/DQNModel.js';
import { getObservation } from './ai/ObservationSpace.js';
import { WEAPON_CHOICES } from './ai/ActionSpace.js';
import { weaponProperties } from './WeaponProperties.js';
import { SoundManager } from './SoundManager.js';
import { Explosion } from './Explosion.js';

// Sound Manager
const soundManager = new SoundManager();
soundManager.createTone('fire', 440, 0.2);
soundManager.createNoise('explosion', 0.6);
soundManager.createSquareTone('damage', 880, 0.2);
soundManager.createTone('click', 660, 0.05);

// Get screen elements
const startScreen = document.getElementById('start-screen') as HTMLElement;
const gameScreen = document.getElementById('game-screen') as HTMLElement;
const gameOverScreen = document.getElementById('game-over-screen') as HTMLElement;
const gameOverMessage = document.getElementById('game-over-message') as HTMLElement;
const startGameButton = document.getElementById('start-game-button') as HTMLButtonElement;
const playAgainButton = document.getElementById('play-again-button') as HTMLButtonElement;



// Main Game Initialization and Loop
let mainGameLoop: any;

function startGame(seed?: number) {
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

  const { playerWurm, aiWurm, terrain, currentTurnProjectiles } = game;
  const initialAngleInput = document.getElementById('angle') as HTMLInputElement;
  playerWurm.barrelAngle = 180 - parseFloat(initialAngleInput.value);

  // AI Model
  let aiModel: DQNModel | null = null;
  

  async function loadModel() {
    try {
      aiModel = await DQNModel.load('/models/dqn-model/model.json');
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

  angleValueSpan.textContent = (180 - parseFloat(angleInput.value)).toString();

  // Update angle and power display
  angleInput.addEventListener('input', () => {
    const angle = 180 - parseFloat(angleInput.value);
    angleValueSpan.textContent = angle.toString();
    playerWurm.barrelAngle = angle;
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

      game.fire(playerWurm, weapon, angle, power);
      soundManager.playSound('fire');

      currentGameState = GameState.EXECUTION;
      whoseTurn = 'ai';
    }
  });

  mainGameLoop = GameLoop({
    update: () => {
      playerWurm.update(terrain);
      aiWurm.update(terrain);

      const prevPlayer = playerWurm.health;
      const prevAi = aiWurm.health;

      game.update();

      switch (currentGameState) {
        case GameState.PLANNING:
          // Player is choosing actions
          break;
        case GameState.EXECUTION:
          if (playerWurm.health < prevPlayer || aiWurm.health < prevAi) {
            soundManager.playSound('explosion');
            soundManager.playSound('damage');
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

          game.fire(aiWurm, aiWeapon, aiAngle, aiPower);
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
      game.draw();

      // Display health (for debugging/testing)
      context.fillStyle = 'white';
      context.font = '16px Arial';
      context.fillText(`Player Health: ${playerWurm.health}`, 10, 20);
      context.fillText(`AI Health: ${aiWurm.health}`, canvas.width - 150, 20);
    }
  });

  mainGameLoop.start();
}

// AI vs AI Demo Loop on the main canvas
const aiDemoCanvas = document.getElementById('game') as HTMLCanvasElement;
aiDemoCanvas.width = 800;
aiDemoCanvas.height = 600;

const aiDemoContext = aiDemoCanvas.getContext('2d') as CanvasRenderingContext2D;

init(aiDemoCanvas);

let aiDemoTerrain: Terrain;
let aiDemoWurm1: Wurm;
let aiDemoWurm2: Wurm;
let aiDemoProjectiles: Projectile[] = [];
let aiDemoExplosions: Explosion[] = [];
let aiDemoTurn: 'wurm1' | 'wurm2' = 'wurm1';

function applyDemoExplosionDamage(x: number, y: number, radius: number, damage: number) {
  const damageWurm = (wurm: Wurm) => {
    const centerX = wurm.x + wurm.width / 2;
    const centerY = wurm.y + wurm.height / 2;
    const distance = Math.hypot(centerX - x, centerY - y);
    if (distance <= radius) {
      wurm.takeDamage(damage);
    }
  };
  damageWurm(aiDemoWurm1);
  damageWurm(aiDemoWurm2);
}

function initAiDemo() {
  aiDemoTerrain = new Terrain(aiDemoCanvas.width, aiDemoCanvas.height, aiDemoContext);
  aiDemoWurm1 = new Wurm(50, aiDemoTerrain.getGroundHeight(50), 100, 'red');
  aiDemoWurm2 = new Wurm(
    aiDemoCanvas.width - 50,
    aiDemoTerrain.getGroundHeight(aiDemoCanvas.width - 50),
    100,
    'yellow'
  );
  aiDemoProjectiles = [];
  aiDemoExplosions = [];
  aiDemoTurn = 'wurm1';
}

const aiDemoLoop = GameLoop({
  update: () => {
    aiDemoWurm1.update(aiDemoTerrain);
    aiDemoWurm2.update(aiDemoTerrain);
    // Simplified AI logic for demo
    if (aiDemoProjectiles.length === 0) {
      const aiAngle = Math.random() * 180;
      const aiPower = Math.random() * 100;
      const aiWeaponOptions = Object.keys(weaponProperties);
      const aiWeapon = aiWeaponOptions[Math.floor(Math.random() * aiWeaponOptions.length)];

      const { radius, damage, explosionRadius, fuse } = weaponProperties[aiWeapon];

      const radians = aiAngle * Math.PI / 180;
      const shooter = aiDemoTurn === 'wurm1' ? aiDemoWurm1 : aiDemoWurm2;
      const direction = aiDemoTurn === 'wurm1' ? 1 : -1;
      shooter.barrelAngle = direction === 1 ? aiAngle : 180 - aiAngle;
      const startX = shooter.x + shooter.width / 2 + Math.cos(radians) * radius * direction - radius;
      const startY = shooter.y + shooter.height / 2 - Math.sin(radians) * radius - radius;
      const velX = aiPower * Math.cos(radians) * 0.15 * direction;
      const velY = aiPower * Math.sin(radians) * -0.15;

      const projectile = new Projectile(
        startX,
        startY,
        velX,
        velY,
        radius,
        damage,
        explosionRadius,
        fuse
      );
      aiDemoProjectiles.push(projectile);
      soundManager.playSound('fire');

      aiDemoTurn = aiDemoTurn === 'wurm1' ? 'wurm2' : 'wurm1';
    }

    for (let i = aiDemoProjectiles.length - 1; i >= 0; i--) {
      const projectile = aiDemoProjectiles[i];
      projectile.update();

      if (aiDemoTerrain.isColliding(projectile.x + projectile.radius, projectile.y + projectile.radius)) {
        console.log(`AI Demo Projectile removed: Terrain collision at x: ${projectile.x}, y: ${projectile.y}, radius: ${projectile.radius}`);
        aiDemoTerrain.destroy(projectile.x + projectile.radius, projectile.y + projectile.radius, projectile.explosionRadius);
        aiDemoExplosions.push(new Explosion(
          projectile.x + projectile.radius,
          projectile.y + projectile.radius,
          projectile.explosionRadius
        ));
        applyDemoExplosionDamage(
          projectile.x + projectile.radius,
          projectile.y + projectile.radius,
          projectile.explosionRadius,
          projectile.damage
        );
        aiDemoProjectiles.splice(i, 1);
        soundManager.playSound('explosion');
      } else if (projectile.x + (projectile.radius * 2) < 0 || projectile.x > aiDemoCanvas.width || projectile.y + (projectile.radius * 2) < 0 || projectile.y > aiDemoCanvas.height) {
        aiDemoProjectiles.splice(i, 1);
      }
    }

    for (let i = aiDemoExplosions.length - 1; i >= 0; i--) {
      const explosion = aiDemoExplosions[i];
      explosion.update();
      if (explosion.isDone()) {
        aiDemoExplosions.splice(i, 1);
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
    for (const explosion of aiDemoExplosions) {
      explosion.draw(aiDemoContext);
    }
  }
});

// Start Game Button
startGameButton.addEventListener('click', () => {
  soundManager.unlock();
  soundManager.playSound('click');
  startScreen.style.display = 'none';
  gameScreen.style.display = 'block';
  aiDemoLoop.stop(); // Stop AI demo when game starts
  aiDemoContext.clearRect(0, 0, aiDemoCanvas.width, aiDemoCanvas.height);
  const param = new URLSearchParams(window.location.search).get('seed');
  const seed = param ? parseInt(param, 10) : undefined;
  startGame(seed); // Start main game loop
});

// Play Again Button
playAgainButton.addEventListener('click', () => {
  gameOverScreen.style.display = 'none';
  startScreen.style.display = 'flex';
  soundManager.unlock();
  soundManager.playSound('click');
  initAiDemo();
  aiDemoLoop.start(); // Restart AI demo
});

initAiDemo();
aiDemoLoop.start(); // Start AI demo loop initially



