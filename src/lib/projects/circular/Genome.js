class Genome {
  constructor(genes) {
    this.genes = genes;
  }
  copy() {
    return new Genome({ ...this.genes });
  }
  mutate = (mutationRate = 0.01) => {
    let mutateValue = (value, rate) =>
      value + (Math.random() * 2 - 1) * value * rate;
    for (const key in this.genes) {
      if (Math.random() < mutationRate) {
        this.genes[key] = mutateValue(this.genes[key], mutationRate);
      }
    }
  };

  crossover = (otherGenome) => {
    const crossoverValue = (value1, value2) =>
      Math.random() < 0.5 ? value1 : value2;
    const newGenes = {};
    for (const key in this.genes) {
      newGenes[key] = crossoverValue(this.genes[key], otherGenome.genes[key]);
    }
    return new Genome(newGenes);
  };
  updateMetrics({ survivalTime, foodEaten, finalEnergyLevel }) {
    this.survivalTime = survivalTime;
    this.foodEaten = foodEaten;
    this.finalEnergyLevel = finalEnergyLevel;
    // console.log(this);
  }
  fitness(creature) {
    // Adjust weights as needed
    const survivalWeight = 0.4;
    const foodWeight = 0.3;
    const energyWeight = 0.3;

    // Calculate individual scores
    const survivalScore = this.calculateSurvivalScore(creature);
    const foodScore = this.calculateFoodScore(creature);
    const energyScore = this.calculateEnergyScore(creature);

    // Combine scores using weighted sum
    const combinedScore =
      survivalWeight * survivalScore +
      foodWeight * foodScore +
      energyWeight * energyScore;

    return combinedScore;
  }

  calculateSurvivalScore(creature) {
    // Assuming maxSurvivalTime is a predefined maximum time a creature can survive
    const maxSurvivalTime = 1000; // You can adjust this based on your simulation
    const normalizedSurvivalTime = creature.survivalTime / maxSurvivalTime;
    return Math.min(normalizedSurvivalTime, 1); // Ensure score is between 0 and 1
  }

  calculateFoodScore(creature) {
    // Assuming maxFoodEaten is the maximum amount of food a creature can eat
    const maxFoodEaten = 100; // Adjust based on your simulation
    const normalizedFoodEaten = creature.foodEaten / maxFoodEaten;
    return Math.min(normalizedFoodEaten, 1); // Ensure score is between 0 and 1
  }

  calculateEnergyScore(creature) {
    // Normalize the energy level by the creature's maximum energy
    const normalizedEnergyLevel = creature.energy / creature.maxEnergy;
    return Math.min(normalizedEnergyLevel, 1); // Ensure score is between 0 and 1
  }
}

export { Genome };
