import { JSDOM } from 'jsdom';
import * as tf from '@tensorflow/tfjs-core';
import '@tensorflow/tfjs-node'; // Use tfjs-node for headless environment
import { promises as fs } from 'fs';

import { init } from './kontra.mock.js';
import { Game } from './Game.js';
import { DQNModel } from './ai/DQNModel.js';
import { getObservation } from './ai/ObservationSpace.js';
import { WEAPON_CHOICES } from './ai/ActionSpace.js';
import { calculateReward } from './ai/RewardFunction.js';
import { ReplayBuffer, Experience } from './ai/ReplayBuffer.js';

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
const { playerWurm, aiWurm } = game;

function getDummyPlayerShot() {
  const weapon = WEAPON_CHOICES[Math.floor(Math.random() * WEAPON_CHOICES.length)];
  const angle = Math.random() * 180;
  const power = Math.random() * 100;
  return { weapon, angle, power };
}

// DQN Model setup
const observationSpaceSize = 2;
const actionSpaceSize = WEAPON_CHOICES.length * 10 * 10;
const dqnModel = new DQNModel([observationSpaceSize], actionSpaceSize);
const targetModel = new DQNModel([observationSpaceSize], actionSpaceSize);
dqnModel.copyWeightsTo(targetModel);

const replayBuffer = new ReplayBuffer(10000);
const batchSize = 32;
const gamma = 0.95;
const targetUpdateFreq = 5;

// Training parameters
const numEpisodes = parseInt(process.argv[2]) || 100;
console.log(`Number of episodes: ${numEpisodes}`);
const epsilonDecay = 0.995;
let epsilon = 1.0;
const epsilonMin = 0.1;
let bestReward = -Infinity;

async function train() {
  for (let episode = 0; episode < numEpisodes; episode++) {
    // Reset game state for new episode
    game.reset();
    game.randomizeSpawnPositions();

    let done = false;
    let totalReward = 0;
    let steps = 0;
    let prevDistance = Math.abs(aiWurm.x - playerWurm.x);

    let episodeQMin = Infinity;
    let episodeQMax = -Infinity;
    let episodeLossSum = 0;
    let episodeLossCount = 0;

    while (!done) {
      const observation = getObservation(playerWurm, aiWurm);
      const qValues = dqnModel.predict(observation);
      const qArr = (qValues.arraySync() as number[][])[0];
      const stepQMin = Math.min(...qArr);
      const stepQMax = Math.max(...qArr);
      episodeQMin = Math.min(episodeQMin, stepQMin);
      episodeQMax = Math.max(episodeQMax, stepQMax);
      let actionIndex: number;

      if (Math.random() < epsilon) {
        // Explore: choose random action
        actionIndex = Math.floor(Math.random() * actionSpaceSize);
      } else {
        // Exploit: choose best action from model prediction
        const argMax = tf.argMax(qValues);
        actionIndex = argMax.dataSync()[0];
        argMax.dispose();
      }
      qValues.dispose();

      // Convert actionIndex back to weapon, angle, power
      const weaponIdx = Math.floor(actionIndex / (10 * 10));
      const angleBin = Math.floor((actionIndex % 100) / 10);
      const powerBin = actionIndex % 10;

      const angle = angleBin * 18; // 0-180 in 10 bins
      const power = powerBin * 10; // 0-100 in 10 bins

      const prevAiHealth = aiWurm.health;
      const prevPlayerHealth = playerWurm.health;

      const weaponName = WEAPON_CHOICES[weaponIdx];
      game.fire(aiWurm, weaponName, angle, power);

      const dummy = getDummyPlayerShot();
      game.fire(playerWurm, dummy.weapon, dummy.angle, dummy.power);

      game.simulateUntilProjectilesResolve();

      const nextObservation = getObservation(playerWurm, aiWurm);
      const newDistance = Math.abs(aiWurm.x - playerWurm.x);
      const distanceDelta = newDistance - prevDistance;
      prevDistance = newDistance;

      // Determine next state and reward

      // Apply damage to wurms (already done in the projectile loop)

      const hitEnemy = playerWurm.health < prevPlayerHealth;
      const hitSelf = aiWurm.health < prevAiHealth;
      const gameEnded = playerWurm.health <= 0 || aiWurm.health <= 0;
      const aiWon = playerWurm.health <= 0 && aiWurm.health > 0;
      const playerWon = aiWurm.health <= 0 && playerWurm.health > 0;

      const reward = calculateReward(aiWurm, playerWurm, hitEnemy, hitSelf, playerWon, aiWon, distanceDelta);
      totalReward += reward;

      const experience: Experience = {
        observation,
        action: actionIndex,
        reward,
        nextObservation,
        done: gameEnded,
      };
      replayBuffer.add(experience);

      if (replayBuffer.size() >= batchSize) {
        const batch = replayBuffer.sample(batchSize);
        const obsBatch = batch.map((b) => b.observation);
        const nextObsBatch = batch.map((b) => b.nextObservation);
        const qCurrTensor = dqnModel.predictBatch(obsBatch) as tf.Tensor2D;
        const qCurr = qCurrTensor.arraySync() as number[][];
        qCurrTensor.dispose();
        const flatQ = qCurr.flat();
        const qMax = Math.max(...flatQ);
        const qMin = Math.min(...flatQ);
        episodeQMin = Math.min(episodeQMin, qMin);
        episodeQMax = Math.max(episodeQMax, qMax);
        const qNextTensor = targetModel.predictBatch(nextObsBatch) as tf.Tensor2D;
        const qNext = qNextTensor.arraySync() as number[][];
        qNextTensor.dispose();
        for (let i = 0; i < batch.length; i++) {
          const { action, reward: r, done: d } = batch[i];
          if (d) {
            qCurr[i][action] = r;
          } else {
            qCurr[i][action] = r + gamma * Math.max(...qNext[i]);
          }
          qCurr[i][action] = Math.max(-100, Math.min(100, qCurr[i][action]));
        }
        const targetTensor = tf.tensor2d(qCurr, [batch.length, actionSpaceSize]);
        const loss = dqnModel.trainBatch(obsBatch, targetTensor);
        episodeLossSum += loss;
        episodeLossCount++;
        targetTensor.dispose();
      }

      if (gameEnded) {
        done = true;
      }

      steps++;
    }

    epsilon = Math.max(epsilonMin, epsilon * epsilonDecay);
    const qRangeStr = isFinite(episodeQMin) && isFinite(episodeQMax)
      ? `${episodeQMin.toFixed(4)} to ${episodeQMax.toFixed(4)}`
      : 'N/A';
    const avgLossStr = episodeLossCount > 0
      ? (episodeLossSum / episodeLossCount).toFixed(6)
      : 'N/A';
    console.log(
      `Episode ${episode + 1}: Total Reward = ${totalReward}, Epsilon = ${epsilon.toFixed(2)}, Q range = ${qRangeStr}, Avg Loss = ${avgLossStr}`
    );

    if ((episode + 1) % targetUpdateFreq === 0) {
      dqnModel.copyWeightsTo(targetModel);
    }

    if (totalReward > bestReward) {
      bestReward = totalReward;
      await fs.mkdir('./src/models', { recursive: true });
      await dqnModel.save('file://./src/models/dqn-model');
    }
  }

  // Save the trained model to the public directory so it can be served
  await fs.mkdir('./public/models', { recursive: true });
  await dqnModel.save('file://./public/models/dqn-model');
  console.log('Model trained and saved.');
}

train();
