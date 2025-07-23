import * as tf from '@tensorflow/tfjs';
import { Observation } from './ObservationSpace.js';

export class DQNModel {
  private model: tf.LayersModel;
  private inputShape: number[];
  private outputSize: number;

  constructor(inputShape: number[], outputSize: number) {
    this.inputShape = inputShape;
    this.outputSize = outputSize;
    this.model = this.buildModel();
  }

  private buildModel(): tf.LayersModel {
    const model = tf.sequential();
    model.add(tf.layers.dense({ units: 64, activation: 'relu', inputShape: this.inputShape }));
    model.add(tf.layers.dense({ units: 64, activation: 'relu' }));
    model.add(tf.layers.dense({ units: this.outputSize })); // Output for Q-values
    model.compile({ optimizer: tf.train.adam(), loss: 'meanSquaredError' });
    return model;
  }

  public predict(observation: Observation): tf.Tensor<tf.Rank> {
    // Flatten the observation into a single array for the neural network input
    const flatObservation = [
      observation.playerWurmX,
      observation.playerWurmY,
      observation.playerWurmHealth,
      observation.aiWurmX,
      observation.aiWurmY,
      observation.aiWurmHealth,
      ...observation.terrainHeights,
    ];
    const inputTensor = tf.tensor2d([flatObservation], [1, this.inputShape[0]]);
    return this.model.predict(inputTensor) as tf.Tensor<tf.Rank>;
  }

  public train(input: tf.Tensor<tf.Rank>, target: tf.Tensor<tf.Rank>) {
    return this.model.fit(input, target);
  }

  public save(path: string) {
    return this.model.save(path);
  }

  public static async load(path: string): Promise<DQNModel> {
    const loadedModel = await tf.loadLayersModel(path);
    // Assuming inputShape and outputSize can be inferred or are fixed
    // For now, we'll need to pass them or infer from the loaded model
    // This is a placeholder, actual implementation might need more robust handling
    const inputShape = (loadedModel.layers[0].input as any).shape.slice(1);
    const outputSize = (loadedModel.layers[loadedModel.layers.length - 1] as any).units;
    const dqnModel = new DQNModel(inputShape as number[], outputSize);
    dqnModel.model = loadedModel;
    return dqnModel;
  }
}
