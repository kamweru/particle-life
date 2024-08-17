import { Genome } from "./Genome";

class Population {
  constructor(size, inputNodes, hiddenNodes, outputNodes) {
    this.genomes = [];
    this.generation = 0;

    for (let i = 0; i < size; i++) {
      this.genomes.push(new Genome(inputNodes, hiddenNodes, outputNodes));
    }
  }

  evolve() {
    // Sort genomes by fitness (highest fitness first)
    this.genomes.sort((a, b) => b.fitness - a.fitness);

    const newGenomes = [];
    const topPerformersCount = Math.floor(this.genomes.length / 2);

    // Retain top performers
    for (let i = 0; i < topPerformersCount; i++) {
      newGenomes.push(this.genomes[i]);
    }

    // Generate new genomes through crossover and mutation
    for (let i = 0; i < topPerformersCount; i++) {
      let parent1 = this.genomes[i];
      let parent2 =
        this.genomes[Math.floor(Math.random() * topPerformersCount)];

      let child = this.crossover(parent1, parent2);
      child.mutate(0.1); // Mutate with a rate of 10%
      newGenomes.push(child);
    }

    // Ensure the population size remains constant
    this.genomes = newGenomes.slice(0, this.genomes.length);
    this.generation++;
  }

  crossover(parent1, parent2) {
    let child = new Genome(
      parent1.network.inputNodes,
      parent1.network.hiddenNodes,
      parent1.network.outputNodes
    );

    for (let i = 0; i < parent1.network.weightsIH.length; i++) {
      for (let j = 0; j < parent1.network.weightsIH[i].length; j++) {
        child.network.weightsIH[i][j] =
          Math.random() > 0.5
            ? parent1.network.weightsIH[i][j]
            : parent2.network.weightsIH[i][j];
      }
    }

    for (let i = 0; i < parent1.network.weightsHO.length; i++) {
      for (let j = 0; j < parent1.network.weightsHO[i].length; j++) {
        child.network.weightsHO[i][j] =
          Math.random() > 0.5
            ? parent1.network.weightsHO[i][j]
            : parent2.network.weightsHO[i][j];
      }
    }

    child.network.biasH = child.network.biasH.map((_, i) =>
      Math.random() > 0.5 ? parent1.network.biasH[i] : parent2.network.biasH[i]
    );
    child.network.biasO = child.network.biasO.map((_, i) =>
      Math.random() > 0.5 ? parent1.network.biasO[i] : parent2.network.biasO[i]
    );

    return child;
  }
}

export { Population };
