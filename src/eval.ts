import { JSDOM } from 'jsdom';

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

async function evaluate(numEpisodes = 1) {
  const model = await SimpleModel.load('./src/models/simple-model.json');
  let totalReward = 0;

  for (let episode = 0; episode < numEpisodes; episode++) {
    game.reset();
    let done = false;
    let episodeReward = 0;
    let prevDistance = Math.abs(aiWurm.x - playerWurm.x);
    let whoseTurn: 'player' | 'ai' = 'player';
    let steps = 0;
    const maxSteps = 200;

    while (!done && steps < maxSteps) {
      const prevAiHealth = aiWurm.health;
      const prevPlayerHealth = playerWurm.health;

      if (whoseTurn === 'ai') {
        const obs = getObservation(playerWurm, aiWurm);
        const [aNorm, pNorm] = model.predict([obs.angleToTarget, obs.distanceToTarget]);
        const angle = ((aNorm + 1) / 2) * 180;
        const power = Math.max(0, Math.min(100, pNorm * 100));
        game.fire(aiWurm, 'bazooka', angle, power);
      } else {
        const dummy = getDummyPlayerShot();
        game.fire(playerWurm, dummy.weapon, dummy.angle, dummy.power);
      }

      game.simulateUntilProjectilesResolve();

      const newDistance = Math.abs(aiWurm.x - playerWurm.x);
      const distanceDelta = newDistance - prevDistance;
      prevDistance = newDistance;

      const hitEnemy =
        whoseTurn === 'ai'
          ? playerWurm.health < prevPlayerHealth
          : aiWurm.health < prevAiHealth;
      const hitSelf =
        whoseTurn === 'ai'
          ? aiWurm.health < prevAiHealth
          : playerWurm.health < prevPlayerHealth;

      const aiWon = playerWurm.health <= 0 && aiWurm.health > 0;
      const playerWon = aiWurm.health <= 0 && playerWurm.health > 0;
      const gameEnded = aiWon || playerWon;

      let reward = 0;
      if (whoseTurn === 'ai') {
        reward = calculateReward(aiWurm, playerWurm, hitEnemy, hitSelf, playerWon, aiWon, distanceDelta);
        episodeReward += reward;
      }

      if (gameEnded) {
        done = true;
      } else {
        whoseTurn = whoseTurn === 'ai' ? 'player' : 'ai';
      }
      steps++;
    }

    if (steps >= maxSteps) {
      console.log(`Episode ${episode + 1}: reached max steps`);
    }

    console.log(`Episode ${episode + 1}: Reward = ${episodeReward}`);
    totalReward += episodeReward;
  }

  console.log(`Average Reward: ${totalReward / numEpisodes}`);
}

const episodes = parseInt(process.argv[2]) || 1;
evaluate(episodes);
