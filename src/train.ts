import { JSDOM } from 'jsdom';
import * as tf from '@tensorflow/tfjs-core';
import '@tensorflow/tfjs-node'; // Use tfjs-node for headless environment

import { init } from './kontra.mock.js';
import { Game } from './Game.js';
import { DQNModel } from './ai/DQNModel.js';
import { getObservation } from './ai/ObservationSpace.js';
import { WEAPON_CHOICES } from './ai/ActionSpace.js';
import { calculateReward } from './ai/RewardFunction.js';

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

// Game setup using shared Game class
const game = new Game(canvas, canvas.getContext('2d')!);
const { playerWurm, aiWurm, terrain } = game;

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
    game.reset();

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

      const prevPlayerHealth = playerWurm.health;
      const prevAiHealth = aiWurm.health;

      const weaponName = WEAPON_CHOICES[weaponIdx];
      game.fire(playerWurm, weaponName, angle, power);
      game.simulateUntilProjectilesResolve();

      // Determine next state and reward

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
      if (gameEnded) {
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
