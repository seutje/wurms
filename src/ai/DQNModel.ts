import * as tf from '@tensorflow/tfjs';
import { Observation } from './ObservationSpace.js';

export class DQNModel {
  private model: tf.LayersModel;
  private inputShape: number[];
  private outputSize: number;
  private optimizer: tf.Optimizer;

  constructor(inputShape: number[], outputSize: number) {
    this.inputShape = inputShape;
    this.outputSize = outputSize;
    this.optimizer = tf.train.adam(0.0005);
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
    model.compile({ optimizer: this.optimizer, loss: 'meanSquaredError' });
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

  public trainBatch(observations: Observation[], targets: tf.Tensor2D): number {
    const inputTensor = this.encodeBatch(observations);
    const { value, grads } = this.optimizer.computeGradients(() => {
      const preds = this.model.predict(inputTensor) as tf.Tensor2D;
      return tf.losses.meanSquaredError(targets, preds).mean() as tf.Scalar;
    });
    const clipped: Record<string, tf.Tensor> = {};
    for (const key in grads) {
      clipped[key] = tf.clipByValue(grads[key], -1, 1);
    }
    this.optimizer.applyGradients(clipped);
    const loss = value.dataSync()[0];
    value.dispose();
    Object.values(grads).forEach((g) => g.dispose());
    Object.values(clipped).forEach((g) => g.dispose());
    inputTensor.dispose();
    return loss;
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
