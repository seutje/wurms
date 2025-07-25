export interface Sample {
  input: [number, number];
  output: [number, number];
}

export class SimpleModel {
  private inputSize = 2;
  private hiddenSize = 10;
  private outputSize = 2;
  private learningRate: number;
  private w1: number[][];
  private b1: number[];
  private w2: number[][];
  private b2: number[];

  constructor(learningRate = 0.1) {
    this.learningRate = learningRate;
    this.w1 = Array.from({ length: this.inputSize }, () =>
      Array.from({ length: this.hiddenSize }, () => Math.random() * 2 - 1)
    );
    this.b1 = Array.from({ length: this.hiddenSize }, () => 0);
    this.w2 = Array.from({ length: this.hiddenSize }, () =>
      Array.from({ length: this.outputSize }, () => Math.random() * 2 - 1)
    );
    this.b2 = Array.from({ length: this.outputSize }, () => 0);
  }

  private static tanh(x: number): number {
    const e = Math.exp(2 * x);
    return (e - 1) / (e + 1);
  }

  private static tanhDeriv(y: number): number {
    return 1 - y * y;
  }

  predict(input: [number, number]): [number, number] {
    const hidden: number[] = [];
    for (let i = 0; i < this.hiddenSize; i++) {
      let sum = this.b1[i];
      sum += input[0] * this.w1[0][i] + input[1] * this.w1[1][i];
      hidden[i] = SimpleModel.tanh(sum);
    }
    const output: number[] = [];
    for (let j = 0; j < this.outputSize; j++) {
      let sum = this.b2[j];
      for (let i = 0; i < this.hiddenSize; i++) {
        sum += hidden[i] * this.w2[i][j];
      }
      output[j] = SimpleModel.tanh(sum);
    }
    return [output[0], output[1]];
  }

  train(samples: Sample[], epochs = 1) {
    for (let e = 0; e < epochs; e++) {
      for (const { input, output } of samples) {
        this.trainSingle(input, output);
      }
    }
  }

  private trainSingle(input: [number, number], target: [number, number]) {
    const hidden: number[] = [];
    const hiddenRaw: number[] = [];
    for (let i = 0; i < this.hiddenSize; i++) {
      let sum = this.b1[i];
      sum += input[0] * this.w1[0][i] + input[1] * this.w1[1][i];
      hiddenRaw[i] = sum;
      hidden[i] = SimpleModel.tanh(sum);
    }
    const outRaw: number[] = [];
    const out: number[] = [];
    for (let j = 0; j < this.outputSize; j++) {
      let sum = this.b2[j];
      for (let i = 0; i < this.hiddenSize; i++) {
        sum += hidden[i] * this.w2[i][j];
      }
      outRaw[j] = sum;
      out[j] = SimpleModel.tanh(sum);
    }

    const outErrors: number[] = [];
    for (let j = 0; j < this.outputSize; j++) {
      const error = target[j] - out[j];
      outErrors[j] = error * SimpleModel.tanhDeriv(out[j]);
    }

    const hiddenErrors: number[] = [];
    for (let i = 0; i < this.hiddenSize; i++) {
      let err = 0;
      for (let j = 0; j < this.outputSize; j++) {
        err += outErrors[j] * this.w2[i][j];
      }
      hiddenErrors[i] = err * SimpleModel.tanhDeriv(hidden[i]);
    }

    for (let i = 0; i < this.hiddenSize; i++) {
      for (let j = 0; j < this.outputSize; j++) {
        this.w2[i][j] += this.learningRate * outErrors[j] * hidden[i];
      }
    }
    for (let j = 0; j < this.outputSize; j++) {
      this.b2[j] += this.learningRate * outErrors[j];
    }
    for (let j = 0; j < this.hiddenSize; j++) {
      this.w1[0][j] += this.learningRate * hiddenErrors[j] * input[0];
      this.w1[1][j] += this.learningRate * hiddenErrors[j] * input[1];
    }
    for (let j = 0; j < this.hiddenSize; j++) {
      this.b1[j] += this.learningRate * hiddenErrors[j];
    }
  }

  /**
   * Update the model based on the received reward for a taken action.
   * The network is nudged towards the sampled action scaled by the reward.
   */
  trainWithReward(
    input: [number, number],
    action: [number, number],
    reward: number
  ) {
    const prediction = this.predict(input);
    const target: [number, number] = [
      prediction[0] + reward * (action[0] - prediction[0]),
      prediction[1] + reward * (action[1] - prediction[1]),
    ];
    target[0] = Math.max(-1, Math.min(1, target[0]));
    target[1] = Math.max(-1, Math.min(1, target[1]));
    this.trainSingle(input, target);
  }

  async save(path: string) {
    const data = {
      w1: this.w1,
      b1: this.b1,
      w2: this.w2,
      b2: this.b2,
    };
    await import('fs/promises').then((fs) => fs.writeFile(path, JSON.stringify(data, null, 2)));
  }

  static async load(path: string): Promise<SimpleModel> {
    const data = JSON.parse(await import('fs/promises').then((fs) => fs.readFile(path, 'utf-8')));
    const model = new SimpleModel();
    model.w1 = data.w1;
    model.b1 = data.b1;
    model.w2 = data.w2;
    model.b2 = data.b2;
    return model;
  }
}
