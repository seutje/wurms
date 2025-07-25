import { JSDOM } from 'jsdom';
import { promises as fs } from 'fs';

import { init } from './kontra.mock.js';
import { Game } from './Game.js';
import { SimpleModel } from './ai/SimpleModel.js';
import { getObservation } from './ai/ObservationSpace.js';
import { WEAPON_CHOICES } from './ai/ActionSpace.js';
import { calculateReward } from './ai/RewardFunction.js';

const dom = new JSDOM(`<!DOCTYPE html><body><canvas id="game"></canvas></body>`);
(global as any).window = dom.window;
(global as any).document = dom.window.document;
(global as any).HTMLCanvasElement = dom.window.HTMLCanvasElement;
(global as any).Image = dom.window.Image;
const seed = 123;

const canvas = dom.window.document.getElementById('game') as HTMLCanvasElement;
canvas.width = 800;
canvas.height = 600;
init(canvas);

const game = new Game(canvas, canvas.getContext('2d')!, seed);
const { playerWurm, aiWurm } = game;

function getDummyPlayerShot() {
  const weapon = WEAPON_CHOICES[Math.floor(Math.random() * WEAPON_CHOICES.length)];
  const angle = Math.random() * 180;
  const power = Math.random() * 100;
  return { weapon, angle, power };
}

const numEpisodes = parseInt(process.argv[2]) || 100;
console.log(`Number of episodes: ${numEpisodes}`);
const model = new SimpleModel();
const sigma = 0.1;

async function train() {
  for (let episode = 0; episode < numEpisodes; episode++) {
    game.reset();
    let done = false;
    let totalReward = 0;
    let steps = 0;
    const maxSteps = 200;
    let prevDistance = Math.abs(aiWurm.x - playerWurm.x);
    let whoseTurn: 'player' | 'ai' = 'player';

    while (!done && steps < maxSteps) {
      const prevAiHealth = aiWurm.health;
      const prevPlayerHealth = playerWurm.health;

      if (whoseTurn === 'ai') {
        const obs = getObservation(playerWurm, aiWurm);
        const [muA, muP] = model.predict([obs.angleToTarget, obs.distanceToTarget]);
        const sampledA = muA + sigma * (Math.random() * 2 - 1);
        const sampledP = muP + sigma * (Math.random() * 2 - 1);
        const clampedA = Math.max(-1, Math.min(1, sampledA));
        const clampedP = Math.max(-1, Math.min(1, sampledP));
        const angle = ((clampedA + 1) / 2) * 180;
        const power = Math.max(0, Math.min(100, clampedP * 100));
        game.fire(aiWurm, 'bazooka', angle, power);
        game.simulateUntilProjectilesResolve();

        const newDistance = Math.abs(aiWurm.x - playerWurm.x);
        const distanceDelta = newDistance - prevDistance;
        prevDistance = newDistance;

        const hitEnemy = playerWurm.health < prevPlayerHealth;
        const hitSelf = aiWurm.health < prevAiHealth;
        const aiWon = playerWurm.health <= 0 && aiWurm.health > 0;
        const playerWon = aiWurm.health <= 0 && playerWurm.health > 0;
        const reward = calculateReward(
          aiWurm,
          playerWurm,
          hitEnemy,
          hitSelf,
          playerWon,
          aiWon,
          distanceDelta
        );
        totalReward += reward;

        model.trainWithReward(
          [obs.angleToTarget, obs.distanceToTarget],
          [clampedA, clampedP],
          reward
        );

        done = aiWon || playerWon;
      } else {
        const dummy = getDummyPlayerShot();
        game.fire(playerWurm, dummy.weapon, dummy.angle, dummy.power);
        game.simulateUntilProjectilesResolve();
        const newDistance = Math.abs(aiWurm.x - playerWurm.x);
        prevDistance = newDistance;
        const aiWon = playerWurm.health <= 0 && aiWurm.health > 0;
        const playerWon = aiWurm.health <= 0 && playerWurm.health > 0;
        done = aiWon || playerWon;
      }

      if (!done) {
        whoseTurn = whoseTurn === 'ai' ? 'player' : 'ai';
      }
      steps++;
    }

    console.log(`Episode ${episode + 1}: Total Reward = ${totalReward}`);
  }

  await fs.mkdir('./src/models', { recursive: true });
  await model.save('./src/models/simple-model.json');
  await fs.mkdir('./public/models', { recursive: true });
  await model.save('./public/models/simple-model.json');
  console.log('Model trained and saved.');
}

train();
