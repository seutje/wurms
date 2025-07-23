export interface Experience {
  observation: import('./ObservationSpace.js').Observation;
  action: number;
  reward: number;
  nextObservation: import('./ObservationSpace.js').Observation;
  done: boolean;
}

export class ReplayBuffer {
  private buffer: Experience[] = [];
  constructor(private maxSize: number) {}

  add(experience: Experience) {
    if (this.buffer.length >= this.maxSize) {
      this.buffer.shift();
    }
    this.buffer.push(experience);
  }

  sample(batchSize: number): Experience[] {
    const samples: Experience[] = [];
    for (let i = 0; i < batchSize; i++) {
      const idx = Math.floor(Math.random() * this.buffer.length);
      samples.push(this.buffer[idx]);
    }
    return samples;
  }

  size(): number {
    return this.buffer.length;
  }
}
