import { JSDOM } from 'jsdom';
import * as tf from '@tensorflow/tfjs-core';
import '@tensorflow/tfjs-node'; // Use tfjs-node for headless environment

import { init } from './kontra.mock.js';
import { Terrain } from './Terrain.js';
import { Projectile } from './Projectile.js';
import { Wurm } from './Wurm.js';
import { DQNModel } from './ai/DQNModel.js';
import { getObservation } from './ai/ObservationSpace.js';
import { WEAPON_CHOICES } from './ai/ActionSpace.js';
import { weaponProperties } from './WeaponProperties.js';
import { calculateReward } from './ai/RewardFunction.js';
import { handleProjectileWurmCollision } from "./collision.js";

// Setup JSDOM for Kontra.js headless environment
const dom = new JSDOM(`<!DOCTYPE html><body><canvas id="game"></canvas></body>`);
(global as any).window = dom.window;
(global as any).document = dom.window.document;
(global as any).HTMLCanvasElement = dom.window.HTMLCanvasElement;
(global as any).Image = dom.window.Image;

const canvas = dom.window.document.getElementById('game') as HTMLCanvasElement;
canvas.width = 800;
canvas.height = 600;

init(canvas);

// Game setup (similar to main.ts)
let terrain = new Terrain(canvas.width, canvas.height, canvas.getContext('2d')!);
const playerWurm = new Wurm(100, 100, 100, 'blue');
const aiWurm = new Wurm(canvas.width - 100, 100, 100, 'green');
const projectiles: Projectile[] = [];

// DQN Model setup
const observationSpaceSize = 6 + (canvas.width / 20); // 6 for wurm data + terrain heights
const actionSpaceSize = WEAPON_CHOICES.length * 10 * 10; // weapon * angle_bins * power_bins (simplified)
const dqnModel = new DQNModel([observationSpaceSize], actionSpaceSize);

// Training parameters
const numEpisodes = parseInt(process.argv[2]) || 100;
console.log(`Number of episodes: ${numEpisodes}`);
const epsilonDecay = 0.995;
let epsilon = 1.0; // Exploration-exploitation trade-off

async function train() {
  for (let episode = 0; episode < numEpisodes; episode++) {
    // Reset game state for new episode
    playerWurm.health = 100;
    aiWurm.health = 100;
    projectiles.length = 0;
    // Regenerate terrain for variety
    terrain = new Terrain(canvas.width, canvas.height, canvas.getContext('2d')!); 
    terrain.draw();

    let done = false;
    let totalReward = 0;

    while (!done) {
      const observation = getObservation(playerWurm, aiWurm, terrain);
      const qValues = dqnModel.predict(observation);
      let actionIndex: number;

      if (Math.random() < epsilon) {
        // Explore: choose random action
        actionIndex = Math.floor(Math.random() * actionSpaceSize);
      } else {
        // Exploit: choose best action from model prediction
        actionIndex = tf.argMax(qValues).dataSync()[0];
      }

      // Convert actionIndex back to weapon, angle, power
      const weaponIdx = Math.floor(actionIndex / (10 * 10));
      const angleBin = Math.floor((actionIndex % 100) / 10);
      const powerBin = actionIndex % 10;

      const angle = angleBin * 18; // 0-180 in 10 bins
      const power = powerBin * 10; // 0-100 in 10 bins

      // Simulate action (fire projectile)
      const weaponName = WEAPON_CHOICES[weaponIdx];
      const { radius, damage, explosionRadius } = weaponProperties[weaponName];

      const startX = playerWurm.x;
      const startY = playerWurm.y;
      const radians = angle * Math.PI / 180;
      const velX = power * Math.cos(radians) * 0.15;
      const velY = power * Math.sin(radians) * -0.15;

      const projectile = new Projectile(
        startX,
        startY,
        velX,
        velY,
        radius,
        damage,
        explosionRadius
      );
      projectiles.push(projectile);
      console.log(`Projectile created: x=${startX}, y=${startY}, velX=${velX}, velY=${velY}`);

      // Simulate game loop update until projectiles resolve
      let allProjectilesResolved = false;
      let simulationIterations = 0;
      const MAX_SIMULATION_ITERATIONS = 5000; // Safeguard to prevent infinite loops

      while (!allProjectilesResolved && simulationIterations < MAX_SIMULATION_ITERATIONS) {
        allProjectilesResolved = true;
        for (let i = projectiles.length - 1; i >= 0; i--) {
          const p = projectiles[i];
          p.update();

          if (handleProjectileWurmCollision(p, playerWurm)) {
            console.log(`Player Wurm took damage. Health: ${playerWurm.health}`);
            projectiles.splice(i, 1);
            continue;
          }

          if (handleProjectileWurmCollision(p, aiWurm)) {
            console.log(`AI Wurm took damage. Health: ${aiWurm.health}`);
            projectiles.splice(i, 1);
            continue;
          }

          if (terrain.isColliding(p.x, p.y)) {
            console.log(`Projectile collided with terrain at x=${p.x}, y=${p.y}!`);
            terrain.destroy(p.x, p.y, p.explosionRadius);
            projectiles.splice(i, 1);
            // Apply damage to wurms
            if (playerWurm.collidesWith(p)) {
              playerWurm.takeDamage(p.damage);
              console.log(`Player Wurm took damage. Health: ${playerWurm.health}`);
            }
            if (aiWurm.collidesWith(p as any)) {
              aiWurm.takeDamage(p.damage);
              console.log(`AI Wurm took damage. Health: ${aiWurm.health}`);
            }
          } else if (p.x < 0 || p.x > canvas.width || p.y > canvas.height) {
            console.log(`Projectile went off-screen at x=${p.x}, y=${p.y}.`);
            projectiles.splice(i, 1);
          } else {
            allProjectilesResolved = false;
          }
        }
        simulationIterations++;
        if (!allProjectilesResolved && simulationIterations >= MAX_SIMULATION_ITERATIONS) {
          console.log(`Simulation reached MAX_SIMULATION_ITERATIONS (${MAX_SIMULATION_ITERATIONS}). Projectiles remaining: ${projectiles.length}`);
        }
      }

      // Determine next state and reward
      const prevPlayerHealth = playerWurm.health;
      const prevAiHealth = aiWurm.health;

      // Apply damage to wurms (already done in the projectile loop)

      const hitEnemy = aiWurm.health < prevAiHealth;
      const hitSelf = playerWurm.health < prevPlayerHealth;
      const gameEnded = playerWurm.health <= 0 || aiWurm.health <= 0;
      const playerWon = aiWurm.health <= 0 && playerWurm.health > 0;
      const aiWon = playerWurm.health <= 0 && aiWurm.health > 0;

      const reward = calculateReward(playerWurm, aiWurm, hitEnemy, hitSelf, gameEnded, playerWon, aiWon);
      totalReward += reward;

      // Q-learning update (simplified for now)
      const targetArray = qValues.arraySync()[0] as number[];
      targetArray[actionIndex] = reward;
      const target = tf.tensor2d([targetArray], [1, actionSpaceSize]);
      await dqnModel.train(observation, target);
      if (gameEnded || simulationIterations >= MAX_SIMULATION_ITERATIONS || numEpisodes > episode) {
        done = true;
      }
    }

    epsilon *= epsilonDecay;
    console.log(`Episode ${episode + 1}: Total Reward = ${totalReward}, Epsilon = ${epsilon.toFixed(2)}`);
  }

  // Save the trained model
  await dqnModel.save('file://./src/models/dqn-model');
  console.log('Model trained and saved.');
}

train();
