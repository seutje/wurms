import { promises as fs } from 'fs';
import { SimpleModel, Sample } from './ai/SimpleModel.js';

const episodes = parseInt(process.argv[2]) || 100;
console.log(`Number of samples: ${episodes * 50}`);

function generateSample(): Sample {
  const angle = Math.random() * 2 - 1; // normalized [-1,1]
  const distance = Math.random(); // [0,1]
  const targetAngle = angle; // ideal output = input
  const targetPower = distance; // ideal output = input
  return { input: [angle, distance], output: [targetAngle, targetPower] };
}

async function train() {
  const model = new SimpleModel();
  const samples: Sample[] = [];
  for (let i = 0; i < episodes * 50; i++) {
    samples.push(generateSample());
  }
  model.train(samples, 5);
  await fs.mkdir('./src/models', { recursive: true });
  await model.save('./src/models/simple-model.json');
  await fs.mkdir('./public/models', { recursive: true });
  await model.save('./public/models/simple-model.json');
  console.log('Model trained and saved.');
}

train();
