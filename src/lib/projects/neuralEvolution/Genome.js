import { NeuralNetwork } from "./NeuralNetwork";

class Genome {
  constructor(inputNodes, hiddenNodes, outputNodes) {
    this.network = new NeuralNetwork(inputNodes, hiddenNodes, outputNodes);
    this.fitness = 0;
  }

  // Mutation function to slightly alter weights and biases
  mutate(rate) {
    const mutateValue = (value) =>
      Math.random() < rate ? value + Math.random() * 0.1 - 0.05 : value;

    this.network.weightsIH = this.network.weightsIH.map((row) =>
      row.map(mutateValue)
    );
    this.network.weightsHO = this.network.weightsHO.map((row) =>
      row.map(mutateValue)
    );
    this.network.biasH = this.network.biasH.map(mutateValue);
    this.network.biasO = this.network.biasO.map(mutateValue);
  }
}

export { Genome };
