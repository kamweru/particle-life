function clamp(value, min, max) {
  return Math.min(Math.max(value, min), max);
}
const geneRanges = {
    headRadius: {
      min: 4,
      max: 10,
    },
    bodyRadius: {
      min: 15,
      max: 25,
    },
    maxVelocity: {
      min: 1,
      max: 8,
    },
    maxForce: {
      min: 0,
      max: 1,
    },
    maxEnergy: {
      min: 500,
      max: 1000,
    },
    maxMass: {
      min: 500,
      max: 1000,
    },
    avoidance: {
      min: 20,
      max: 200,
    },
    smellRadius: {
      min: 100,
      max: 500,
    },
    wanderTimeStep: {
      min: 0,
      max: 1,
    },
    energyConsumption: {
      min: 0,
      max: 1,
    },
    massToEnergyConversionRate: {
      min: 0,
      max: 1,
    },
    maxSpeedIndex: {
      min: 0,
      max: 3,
    },
  },
  config = { survivalWeight: 0.24, foodWeight: 0.28, energyWeight: 0.48 },
  randomizeWeights = () => {
    const random1 = parseFloat(Math.random().toFixed(2));
    const random2 = parseFloat(Math.random().toFixed(2));
    config.survivalWeight = Math.min(random1, random2);
    config.foodWeight = parseFloat(Math.abs(random1 - random2).toFixed(2));
    config.energyWeight = parseFloat(
      (1 - config.survivalWeight - config.foodWeight).toFixed(2)
    );
    // const totalWeight = Object.values(config).reduce(
    //   (sum, weight) => sum + weight,
    //   0
    // );

    // for (const key in config) {
    //   config[key] = Math.random() * totalWeight;
    // }
    // // Ensure weights sum to 1
    // const totalWeight = Object.values(config).reduce(
    //   (acc, weight) => acc + weight,
    //   0
    // );
    // if (totalWeight !== 1) {
    //   throw new Error("Weights must sum to 1");
    // }

    // // Generate random weights
    // const randomizedConfig = {};
    // let remainingWeight = 1;
    // for (const key in config) {
    //   const randomWeight = Math.random() * remainingWeight;
    //   randomizedConfig[key] = randomWeight;
    //   remainingWeight -= randomWeight;
    // }

    // // Normalize weights to ensure they sum to 1
    // const normalizedConfig = {};
    // const totalRandomWeight = Object.values(randomizedConfig).reduce(
    //   (acc, weight) => acc + weight,
    //   0
    // );
    // for (const key in randomizedConfig) {
    //   config[key] = randomizedConfig[key] / totalRandomWeight;
    // }
    // config = {...normalizedConfig};
    // return normalizedConfig;
  },
  weightSetup = (payload) => {
    for (let key in payload) {
      config[key] = payload[key];
    }
  };
class Genome {
  constructor(genes) {
    this.genes = genes;
  }
  copy() {
    return new Genome({ ...this.genes });
  }
  // mutate = (mutationRate = 0.01) => {
  //   for (const key in this.genes) {
  //     if (Math.random() < mutationRate) {
  //       const min = geneRanges[key].min;
  //       const max = geneRanges[key].max;
  //       this.genes[key] = Math.clamp(
  //         this.genes[key] + (Math.random() - 0.5) * 2 * mutationRate,
  //         min,
  //         max
  //       );
  //     }
  //   }
  // };
  mutate = (mutationRate = 0.01) => {
    for (const key in this.genes) {
      if (Math.random() < mutationRate) {
        const min = geneRanges[key].min;
        const max = geneRanges[key].max;
        this.genes[key] = clamp(
          this.genes[key] + (Math.random() - 0.5) * 2 * mutationRate,
          min,
          max
        );
      }
    }
  };
  crossover = (otherGenome) => {
    const newGenes = {};
    for (const key in this.genes) {
      newGenes[key] =
        Math.random() < 0.5 ? this.genes[key] : otherGenome.genes[key]; // Uniform crossover
    }
    return new Genome(newGenes);
  };
  // mutate = (mutationRate = 0.01) => {
  //   let mutateValue = (value, rate) =>
  //     value + (Math.random() * 2 - 1) * value * rate;
  //   for (const key in this.genes) {
  //     if (Math.random() < mutationRate) {
  //       this.genes[key] = mutateValue(this.genes[key], mutationRate);
  //     }
  //   }
  // };

  // crossover = (otherGenome) => {
  //   const crossoverValue = (value1, value2) =>
  //     Math.random() < 0.5 ? value1 : value2;
  //   const newGenes = {};
  //   for (const key in this.genes) {
  //     newGenes[key] = crossoverValue(this.genes[key], otherGenome.genes[key]);
  //   }
  //   return new Genome(newGenes);
  // };
  updateMetrics({ survivalTime, foodEaten, finalEnergyLevel }) {
    this.survivalTime = survivalTime;
    this.foodEaten = foodEaten;
    this.finalEnergyLevel = finalEnergyLevel;
    // console.log(this);
  }
  fitness(creature) {
    // Adjust weights as needed
    // const survivalWeight = 0.4;
    // const foodWeight = 0.3;
    // const energyWeight = 0.3;
    const { survivalWeight, foodWeight, energyWeight } = config;
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
    const maxFoodEaten = 200; // Adjust based on your simulation
    const normalizedFoodEaten = creature.foodEaten / maxFoodEaten;
    return Math.min(normalizedFoodEaten, 1); // Ensure score is between 0 and 1
  }

  calculateEnergyScore(creature) {
    // Normalize the energy level by the creature's maximum energy
    const normalizedEnergyLevel = creature.energy / creature.maxEnergy;
    return Math.min(normalizedEnergyLevel, 1); // Ensure score is between 0 and 1
  }
}
const getConfig = () => config;
export { Genome, weightSetup, getConfig, randomizeWeights };
