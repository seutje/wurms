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

  public copyWeightsTo(target: DQNModel) {
    const weights = this.model.getWeights();
    target.model.setWeights(weights.map((w) => w.clone()));
  }

  private buildModel(): tf.LayersModel {
    const model = tf.sequential();
    model.add(tf.layers.dense({ units: 64, activation: 'relu', inputShape: this.inputShape }));
    model.add(tf.layers.dense({ units: 64, activation: 'relu' }));
    model.add(tf.layers.dense({ units: this.outputSize })); // Output for Q-values
    model.compile({ optimizer: tf.train.adam(), loss: 'meanSquaredError' });
    return model;
  }

  private encode(observation: Observation): tf.Tensor2D {
    const flatObservation = [
      observation.playerWurmX,
      observation.playerWurmY,
      observation.playerWurmHealth,
      observation.aiWurmX,
      observation.aiWurmY,
      observation.aiWurmHealth,
      ...observation.terrainHeights,
    ];
    return tf.tensor2d([flatObservation], [1, this.inputShape[0]]);
  }

  private encodeBatch(observations: Observation[]): tf.Tensor2D {
    const data = observations.map((obs) => [
      obs.playerWurmX,
      obs.playerWurmY,
      obs.playerWurmHealth,
      obs.aiWurmX,
      obs.aiWurmY,
      obs.aiWurmHealth,
      ...obs.terrainHeights,
    ]);
    return tf.tensor2d(data, [observations.length, this.inputShape[0]]);
  }

  public predict(observation: Observation): tf.Tensor<tf.Rank> {
    return this.model.predict(this.encode(observation)) as tf.Tensor<tf.Rank>;
  }

  public predictBatch(observations: Observation[]): tf.Tensor {
    return this.model.predict(this.encodeBatch(observations)) as tf.Tensor;
  }

  public train(observation: Observation, target: tf.Tensor<tf.Rank>) {
    const inputTensor = this.encode(observation);
    return this.model.fit(inputTensor, target);
  }

  public trainBatch(observations: Observation[], targets: tf.Tensor) {
    const inputTensor = this.encodeBatch(observations);
    return this.model.fit(inputTensor, targets);
  }

  public getOutputSize() {
    return this.outputSize;
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
