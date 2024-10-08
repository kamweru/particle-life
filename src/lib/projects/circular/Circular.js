import { getRandomFloat, getRandomFromRange, range } from "../../utils";
import { Vector } from "./Vector";
import { Genome, randomizeWeights } from "./Genome";
class Food {
  constructor(x, y, energy, mass) {
    this.position = new Vector(x, y);
    this.velocity = new Vector(getRandomFloat(), getRandomFloat());
    this.energy = energy;
    this.mass = mass;
    this.dead = false;
    this.r = 4;
    this.c = `hsl(126, 100%, 50%)`;
  }
  draw(ctx) {
    if (this.dead) return;
    ctx.fillStyle = this.c;
    ctx.beginPath();
    ctx.arc(this.position.x, this.position.y, this.r, 0, 2 * Math.PI);
    ctx.closePath();
    ctx.fill();
  }

  update(environment) {
    const buffer = 50;
    this.position.add(this.velocity);
    if (
      this.position.x > environment.width - buffer ||
      this.position.x < buffer ||
      this.position.y > environment.height - buffer ||
      this.position.y < buffer
    ) {
      this.energy = 0;
      this.dead = true;
    }
  }
}
class Poison {
  constructor(x, y, massDamage, energyDamage) {
    this.position = new Vector(x, y);
    this.velocity = new Vector(getRandomFloat(), getRandomFloat());
    this.massDamage = massDamage;
    this.energyDamage = energyDamage;
    this.dead = false;
    this.r = 4;
    this.c = `hsl(359, 100%, 50%)`;
  }
  draw(ctx) {
    if (this.dead) return;
    ctx.fillStyle = this.c;
    ctx.beginPath();
    ctx.arc(this.position.x, this.position.y, this.r, 0, 2 * Math.PI);
    ctx.closePath();
    ctx.fill();
  }
  update(environment) {
    this.position.add(this.velocity);
    if (
      this.position.x > environment.width ||
      this.position.x < 0 ||
      this.position.y > environment.height ||
      this.position.y < 0
    ) {
      this.dead = true;
    }
  }
}
function getTangentPoints(c1, c2) {
  const { atan, asin, cos, PI, sin, sqrt } = Math;
  if (c1.position.x > c2.position.x) {
    let temp = c1;
    c1 = c2;
    c2 = temp;
  }
  const {
    position: { x: x1, y: y1 },
    radius: r1,
  } = c1;
  const {
    position: { x: x2, y: y2 },
    radius: r2,
  } = c2;
  const gamma = atan((y1 - y2) / (x2 - x1));
  const beta = asin((r2 - r1) / sqrt((x2 - x1) ** 2 + (y2 - y1) ** 2));
  const alpha = gamma - beta;
  const theta = gamma + beta;
  const t1 = {
    x: x1 + r1 * cos(PI / 2 - alpha),
    y: y1 + r1 * sin(PI / 2 - alpha),
  };
  const t2 = {
    x: x2 + r2 * cos(PI / 2 - alpha),
    y: y2 + r2 * sin(PI / 2 - alpha),
  };
  const t3 = {
    x: x1 + r1 * cos(-PI / 2 - theta),
    y: y1 + r1 * sin(-PI / 2 - theta),
  };
  const t4 = {
    x: x2 + r2 * cos(-PI / 2 - theta),
    y: y2 + r2 * sin(-PI / 2 - theta),
  };
  return [t1, t2, t3, t4];
}
class Creature {
  constructor(payload, genome) {
    const { headPos, bodyPos, c } = payload,
      {
        headRadius,
        bodyRadius,
        maxVelocity,
        maxForce,
        maxEnergy,
        maxMass,
        avoidance,
        smellRadius,
        wanderTimeStep,
        energyConsumption,
        massToEnergyConversionRate,
        maxSpeedIndex,
      } = genome.genes;
    this.head = {
      position: new Vector(headPos.x, headPos.y),
      radius: headRadius,
      c: `hsl(${c}, 100%, 50%)`,
    };
    this.body = {
      position: new Vector(bodyPos.x, bodyPos.y),
      radius: bodyRadius,
      c: `hsl(${c}, 100%, 50%)`,
    };
    this.velocity = new Vector(0, 0);
    this.acceleration = new Vector(0, 0);
    this.wandering = new Vector(getRandomFloat(), getRandomFloat());
    this.wanderTimeStep = wanderTimeStep;
    this.wanderAngle = getRandomFromRange(0, 360);
    this.avoidance = avoidance;
    this.smellRadius = smellRadius;
    this.maxForce = maxForce;
    this.maxVelocity = maxVelocity;
    this.mass = 400;
    this.energy = 400;
    this.maxEnergy = maxEnergy;
    this.maxMass = maxMass;
    this.dead = false;
    this.eating = false;
    this.energyConsumption = energyConsumption;
    this.massToEnergyConversionRate = massToEnergyConversionRate;
    this.maxSpeedIndex = Math.floor(maxSpeedIndex);
    this.creationTime = Date.now();
    this.survivalTime = 0;
    this.foodEaten = 0;
    this.genome = genome;
    this.fitness = 0;
  }
  convertMassToEnergy() {
    if (this.energy < this.maxEnergy * 0.5 && this.mass > this.maxMass * 0.5) {
      //   const massToConvert = this.mass * this.massToEnergyConversionRate;
      //   const efficiencyFactor = this.energy / this.maxEnergy; // Adjust as needed
      //   this.mass -= massToConvert * efficiencyFactor;
      //   this.energy += massToConvert * 10;
      const massToConvert = this.mass * this.massToEnergyConversionRate;
      const energyGain = massToConvert * 10;
      const energyLossFactor = 0.1; // Adjust as needed
      this.mass -= massToConvert;
      this.energy += energyGain * (1 - energyLossFactor);
      //   const massToConvert = this.mass * this.massToEnergyConversionRate;
      //   this.mass -= massToConvert;
      //   this.energy += massToConvert * 10;
    }
  }
  getMaxSpeed() {
    let decider = this.maxSpeedIndex;
    if (decider === 0) {
      const baseSpeed = this.maxVelocity / (1 + this.mass / 10);
      const energyFactor = Math.max(0, this.energy / this.maxEnergy); // Ensure energy factor is non-negative
      const speedDecay = Math.pow(energyFactor, 2); // Quadratic decay for more pronounced effect at low energy
      return baseSpeed * energyFactor * speedDecay;
    } else if (decider === 1) {
      const baseSpeed = this.maxVelocity / (1 + this.mass / 10); // Or use your preferred base speed calculation
      const energyFactor = this.energy / this.maxEnergy; // Normalize energy to a value between 0 and 1
      return baseSpeed * energyFactor;
    } else if (decider === 2) {
      const energyFactor = this.energy / this.maxEnergy; // Adjust as needed
      return this.maxVelocity * energyFactor;
    } else if (decider === 3) {
      const massFactor = 1 + this.mass / this.maxMass; // Adjust as needed
      return this.maxVelocity / massFactor;
    }
  }
  getEnergyConsumption() {
    const speedSquared = this.velocity.magnitude() ** 2;
    return 0.5 * this.mass * speedSquared;
    // const speed = this.velocity.magnitude();
    // return (speed * this.mass) / 10;
  }
  update = () => {
    // this.convertMassToEnergy();
    if (!this.dead) {
      const currentTime = Date.now();
      this.survivalTime = (currentTime - this.creationTime) / 1000; // Survival time in seconds
    }
    this.genetic();
    // this.energy -= this.getEnergyConsumption() + this.energyConsumption;
    this.velocity.add(this.acceleration);
    this.velocity.limit(this.getMaxSpeed());
    // this.velocity.limit(this.getMaxSpeed());
    // console.log(this.energyConsumption);
    this.body.position.add(this.velocity);
    this.acceleration.set(0, 0);
    const angle = Math.atan2(
      this.head.position.y - this.body.position.y,
      this.head.position.x - this.body.position.x
    );
    this.body.position.x += Math.cos(angle) * this.maxVelocity;
    this.body.position.y += Math.sin(angle) * this.maxVelocity;
    this.head.position.x =
      this.body.position.x +
      Math.cos(angle) * (this.body.radius + this.head.radius);
    this.head.position.y =
      this.body.position.y +
      Math.sin(angle) * (this.body.radius + this.head.radius);
    this.acceleration.multiply(0);
    if (this.energy < 0) {
      this.dead = true;
      //   console.log("dead");
    }
    this.wander();
  };
  genetic = () => {
    this.genome.updateMetrics({
      survivalTime: this.survivalTime,
      foodEaten: this.foodEaten,
      finalEnergyLevel: this.energy,
    });
    this.fitness = this.genome.fitness({
      survivalTime: this.survivalTime,
      foodEaten: this.foodEaten,
      finalEnergyLevel: this.energy,
      maxEnergy: this.maxEnergy,
      energy: this.energy,
    });
  };
  wander = () => {
    if (Math.random() < 0.05) {
      this.wandering.rotate(Math.PI * 2 * Math.random());
    }
    let circleCenter = this.velocity.copy().normalize(),
      displacement = new Vector(0, -1),
      wanderForce = new Vector(0, 0);
    displacement.multiply(1);
    displacement.rotateDegs(this.wanderAngle);
    this.wanderAngle += Math.random() * 30 - 15;
    wanderForce = circleCenter.add(displacement);
    wanderForce.multiply(0.4);
    if (this.eating) {
      wanderForce.multiply(0.005);
    }
    this.applyForce(wanderForce);
  };
  nearbyFood = (foods) => {
    let nearestFood = null;
    let minDist = Infinity;
    foods.forEach((food) => {
      let {
        position: { x: foodX, y: foodY },
      } = food;
      const dist = Math.sqrt(
        (this.head.position.x - foodX) ** 2 +
          (this.head.position.y - foodY) ** 2
      );
      if (dist < minDist) {
        minDist = dist;
        nearestFood = food;
      }
    });

    if (nearestFood !== null) {
      this.eat(nearestFood);
    }
  };
  eat = (food) => {
    let {
      position: { x, y },
    } = food;

    const dist = Math.sqrt(
      (this.head.position.x - x) ** 2 + (this.head.position.y - y) ** 2
    );

    if (
      Math.sqrt(
        (this.body.position.x - x) ** 2 + (this.body.position.y - y) ** 2
      ) < this.body.radius
    ) {
      food.dead = true;
      this.eating = false;
      return;
    }
    const angle = Math.atan2(
      y - this.body.position.y,
      x - this.body.position.x
    );
    this.body.position.x += Math.cos(angle) * this.maxVelocity;
    this.body.position.y += Math.sin(angle) * this.maxVelocity;
    this.head.position.x =
      this.body.position.x +
      Math.cos(angle) * (this.body.radius + this.head.radius);
    this.head.position.y =
      this.body.position.y +
      Math.sin(angle) * (this.body.radius + this.head.radius);

    if (dist <= this.head.radius) {
      this.eating = true;
      const energyGain = food.energy * 0.2 * (1 - this.energy / this.maxEnergy);
      const massGain = food.mass * 0.2 * (1 - this.mass / this.maxMass);
      this.energy = Math.min(this.maxEnergy, this.energy + energyGain);
      this.mass = Math.min(this.maxMass, this.mass + massGain);
      this.foodEaten += 1;
      food.dead = true;
    } else {
      this.eating = false;
    }
  };
  boundaries = (canvas) => {
    const buffer = 50,
      { width, height } = canvas;
    if (
      this.head.position.x + this.head.radius < buffer ||
      this.body.position.x + this.body.radius < buffer
    ) {
      let desiredVelocity = new Vector(this.getMaxSpeed(), this.velocity.y);
      desiredVelocity
        .normalize()
        .multiply(this.getMaxSpeed())
        .subtract(this.velocity)
        .multiply(this.getMaxSpeed() * 13);
      this.applyForce(desiredVelocity);
    }
    if (
      this.head.position.x > width - buffer ||
      this.body.position.x > width - buffer
    ) {
      let desiredVelocity = new Vector(-this.getMaxSpeed(), this.velocity.y);

      desiredVelocity
        .normalize()
        .multiply(this.getMaxSpeed())
        .subtract(this.velocity)
        .multiply(this.getMaxSpeed() * 13);
      this.applyForce(desiredVelocity);
    }
    if (
      this.head.position.y + this.head.radius < buffer ||
      this.body.position.y + this.body.radius < buffer
    ) {
      let desiredVelocity = new Vector(this.velocity.x, this.getMaxSpeed());

      desiredVelocity
        .normalize()
        .multiply(this.getMaxSpeed())
        .subtract(this.velocity)
        .multiply(this.getMaxSpeed() * 31);
      this.applyForce(desiredVelocity);
    }
    if (
      this.head.position.y > height - buffer ||
      this.body.position.y > height - buffer
    ) {
      let desiredVelocity = new Vector(this.velocity.x, -this.getMaxSpeed());

      desiredVelocity
        .normalize()
        .multiply(this.getMaxSpeed())
        .subtract(this.velocity)
        .multiply(this.getMaxSpeed() * 13);
      this.applyForce(desiredVelocity);
    }
  };

  handleCollision = (otherCreature) => {
    let bodyDist = this.body.position.dist(otherCreature.body.position);
    let headDist = this.head.position.dist(otherCreature.head.position);
    if (
      bodyDist < this.body.radius + otherCreature.body.radius ||
      headDist < this.head.radius + otherCreature.head.radius
    ) {
      const angle = Math.atan2(
        otherCreature.body.y - this.body.y,
        otherCreature.body.x - this.body.x
      );
      const oppositeAngle = angle + Math.PI;
      let bodySeparationForce = this.body.position
          .copy()
          .subtract(otherCreature.body.position)
          .normalize()
          .multiply(this.maxVelocity * 2),
        headSeparationForce = this.head.position
          .copy()
          .subtract(otherCreature.head.position)
          .normalize()
          .multiply(this.maxVelocity * 2);
      let separationForce = bodySeparationForce.add(headSeparationForce);
      // .add(new Vector(oppositeAngle, oppositeAngle));
      //   this.applyForce(separationForce);
      //   this.velocity.add(separationForce);
      //   this.velocity.limit(this.getMaxSpeed());
      this.body.position.add(separationForce);
      this.head.position.add(separationForce);
      //   let avoid = otherCreature.body.position
      //     .copy()
      //     .subtract(this.body.position)
      //     .normalize()
      //     .multiply(this.avoidance);
      //   let avoid1 = this.body.position
      //     .copy()
      //     .add(otherCreature.body.position)
      //     .normalize()
      //     .multiply(otherCreature.avoidance);
      //   this.body.position.add(avoid);
      //   otherCreature.body.position.add(avoid1);
    }
  };
  checkCollision = (creatures) => {
    for (let i = 0; i < creatures.length; i++) {
      let creature = creatures[i];
      if (creature !== this) {
        this.handleCollision(creature);
      }
    }
  };
  detectPoison(poisonList) {
    let nearestPoison = null;
    let minDist = Infinity;

    for (const poison of poisonList) {
      if (!poison.dead) {
        const dist = Math.hypot(
          this.head.position.x - poison.position.x,
          this.head.position.y - poison.position.y
        );

        if (dist < minDist) {
          minDist = dist;
          nearestPoison = poison;
        }
      }
    }
    if (nearestPoison) {
      if (
        Math.sqrt(
          (this.body.position.x - nearestPoison.position.x) ** 2 +
            (this.body.position.y - nearestPoison.position.y) ** 2
        ) < this.body.radius
      ) {
        nearestPoison.dead = true;
        console.log("dead");
        // this.eating = false;
        return;
      }
      if (minDist < this.head.radius + nearestPoison.r + this.avoidance) {
        // Avoid or eat based on a certain condition (e.g., distance or random chance)
        if (minDist < this.head.radius + nearestPoison.r) {
          this.eatPoison(nearestPoison);
        } else {
          this.avoidPoison(nearestPoison);
        }
      }
    }
  }

  eatPoison(poison) {
    // Reduce mass and energy based on poison properties
    this.mass = Math.max(0, this.mass - poison.massDamage);
    this.energy = Math.max(0, this.energy - poison.energyDamage);

    console.log("eat");
    poison.dead = true;
  }

  avoidPoison(poison) {
    const angle = Math.atan2(
      this.body.position.y - poison.position.y,
      this.body.position.x - poison.position.x
    );
    let oppositeAngle = angle + Math.PI;
    const avoidForce = new Vector(
      Math.cos(oppositeAngle) * this.getMaxSpeed(),
      Math.sin(oppositeAngle) * this.getMaxSpeed()
    );
    this.applyForce(avoidForce);
  }
  applyForce = (f) => {
    this.acceleration.add(f).limit(this.maxForce * 1.5);
    this.velocity.add(this.acceleration);
    this.velocity.limit(this.maxVelocity); // Ensure it doesn't exceed the max velocity
    const angle = Math.atan2(
      this.head.position.y - this.body.position.y,
      this.head.position.x - this.body.position.x
    );
    this.body.position.add(this.velocity);
    this.head.position.x =
      this.body.position.x +
      Math.cos(angle) * (this.body.radius + this.head.radius);
    this.head.position.y =
      this.body.position.y +
      Math.sin(angle) * (this.body.radius + this.head.radius);
    this.acceleration.set(0, 0); // Reset acceleration after applying force
  };
  draw = (ctx) => {
    ctx.fillStyle = this.head.c;
    ctx.beginPath();
    ctx.arc(
      this.head.position.x,
      this.head.position.y,
      this.head.radius,
      0,
      2 * Math.PI
    );
    ctx.closePath();
    ctx.fill();
    ctx.strokeStyle = this.body.c;
    ctx.beginPath();
    ctx.arc(
      this.body.position.x,
      this.body.position.y,
      this.body.radius,
      0,
      2 * Math.PI
    );
    ctx.closePath();
    ctx.stroke();

    // ctx.fillStyle = this.body.c;
    // ctx.font = "20px serif";
    // ctx.fillText(
    //   this.fitness.toFixed(2),
    //   this.body.position.x - this.body.radius,
    //   this.body.position.y - this.body.radius
    // );
    if (this.energy > 0) {
      const startAngle = -Math.PI / 2;
      const endAngle =
        startAngle + (2 * Math.PI * this.energy) / this.maxEnergy;
      ctx.fillStyle = this.body.c;
      ctx.beginPath();
      ctx.arc(
        this.body.position.x,
        this.body.position.y,
        this.body.radius,
        startAngle,
        endAngle
      );
      ctx.lineTo(this.body.position.x, this.body.position.y);
      ctx.closePath();
      ctx.fill();
    }
  };
}

export const Circular = (() => {
  const config = {
      numCreatures: 10,
      numFood: 40,
      numPoison: 30,
      frames: 0,
      evolutionTimer: 100,
      evolver: 0.111,
      topCreaturesDivider: 5,
      detectPoison: false,
      generations: [],
    },
    getGenome = () =>
      new Genome({
        headRadius: getRandomFromRange(4, 10),
        bodyRadius: getRandomFromRange(15, 25),
        maxVelocity: getRandomFromRange(1, 8),
        maxForce: Math.random() * 1,
        maxEnergy: getRandomFromRange(500, 1000),
        maxMass: getRandomFromRange(500, 1000),
        avoidance: getRandomFromRange(20, 200),
        smellRadius: getRandomFromRange(100, 500),
        wanderTimeStep: Math.random() * 1,
        energyConsumption: Math.random() * 1,
        massToEnergyConversionRate: Math.random() * 1,
        maxSpeedIndex: Math.random() * 4,
      }),
    hues = [8, 24, 40, 64, 80, 112, 180, 196, 216, 264, 272, 288, 328, 352],
    selectedHue = [];
  let mutationRate = getRandomFloat();
  const initCreatures = () => {
    const creatures = [],
      foodArr = [],
      poisonArr = [],
      { canvas } = config;
    for (let i = 0; i < config.numCreatures; i++) {
      let genome = getGenome();
      mutationRate = mutationRate < 0 ? mutationRate * -1 : mutationRate;
      genome.mutate(mutationRate);
      let bodyPos = getRandomFromRange(0, canvas.height),
        headPos = getRandomFromRange(0, canvas.height),
        c = hues[i];

      //   console.log(genome.genes);
      creatures.push(
        new Creature(
          {
            headPos: { x: headPos, y: headPos },
            bodyPos: { x: bodyPos, y: bodyPos },
            c,
          },
          genome
        )
      );
    }
    for (let i = 0; i < config.numFood; i++) {
      const food = new Food(
        getRandomFromRange(0, config.canvas.width),
        getRandomFromRange(0, config.canvas.height),
        getRandomFromRange(10, 50),
        getRandomFromRange(10, 50)
      );
      foodArr.push(food);
    }
    for (let i = 0; i < config.numPoison; i++) {
      const poison = new Poison(
        getRandomFromRange(0, config.canvas.width),
        getRandomFromRange(0, config.canvas.height),
        getRandomFromRange(10, 20),
        getRandomFromRange(10, 20)
      );
      poisonArr.push(poison);
    }
    config.creatures = creatures;
    config.food = foodArr;
    config.poison = poisonArr;
  };
  const updateCreatures = () => {
    const { ctx } = config;
    if (config.creatures.length === 0) {
      //   initCreatures();
      stop();
      return;
    }
    for (let i = 0; i < config.creatures.length; i++) {
      const creature = config.creatures[i];
      if (creature.energy < 0) {
        creature.dead = true;
      }
      if (creature.dead) {
        config.creatures.splice(i, 1);
        i--;
      }
      if (Math.random() < config.evolver) {
        mutationRate = getRandomFloat();
        mutationRate = mutationRate < 0 ? mutationRate * -1 : mutationRate;
        creature.genome.mutate(mutationRate);
      }
      creature.update();
      creature.draw(config.ctx);
      creature.nearbyFood(config.food);
      creature.detectPoison(config.poison);
      creature.checkCollision(config.creatures);
      creature.boundaries(config.canvas);
      const [t1, t2, t3, t4] = getTangentPoints(creature.head, creature.body);

      ctx.beginPath();
      ctx.strokeStyle = creature.body.c;
      ctx.lineWidth = 1;
      ctx.moveTo(t1.x, t1.y);
      ctx.lineTo(t2.x, t2.y);
      ctx.moveTo(t3.x, t3.y);
      ctx.lineTo(t4.x, t4.y);
      ctx.stroke();
    }
    for (let i = 0; i < config.food.length; i++) {
      const food = config.food[i];
      if (food.dead) {
        config.food.splice(i, 1);
        i--;
      }
      food.update(config.canvas);
      food.draw(config.ctx);
    }
    if (config.food.length < config.numFood) {
      const food = new Food(
        getRandomFromRange(0, config.canvas.width),
        getRandomFromRange(0, config.canvas.height),
        getRandomFromRange(10, 50),
        getRandomFromRange(10, 50)
      );
      config.food.push(food);
    }
    for (let i = 0; i < config.poison.length; i++) {
      const poison = config.poison[i];
      if (poison.dead) {
        config.poison.splice(i, 1);
        i--;
      }
      poison.update(config.canvas);
      poison.draw(config.ctx);
    }
    if (config.poison.length < config.numPoison) {
      const poison = new Poison(
        getRandomFromRange(0, config.canvas.width),
        getRandomFromRange(0, config.canvas.height),
        getRandomFromRange(10, 20),
        getRandomFromRange(10, 20)
      );
      config.poison.push(poison);
    }
  };
  const evolveCreatures = () => {
    if (config.frames > 0) {
      mutationRate = getRandomFloat();
      mutationRate = mutationRate < 0 ? mutationRate * -1 : mutationRate;
      // Sort creatures by fitness (higher fitness first)
      config.creatures.sort((a, b) => b.fitness - a.fitness);

      // Select top performers and mutate
      const topCreatures = config.creatures.slice(
        0,
        config.numCreatures / config.topCreaturesDivider
      );
      const newCreatures = [];
      // console.log(topCreatures);
      for (const creature of topCreatures) {
        let newGenome = creature.genome.copy();
        newGenome.mutate(mutationRate);
        // console.log(creature);
        let newCreature = new Creature(
          {
            headPos: {
              x: getRandomFromRange(0, config.canvas.width),
              y: getRandomFromRange(0, config.canvas.height),
            },
            bodyPos: {
              x: getRandomFromRange(0, config.canvas.width),
              y: getRandomFromRange(0, config.canvas.height),
            },
            c: hues[getRandomFromRange(0, hues.length)],
          },
          newGenome
        );
        if (Math.random() < config.evolver) {
          let child1Genome = topCreatures[0].genome.copy();
          let child2Genome = topCreatures[1].genome.copy();
          child1Genome.crossover(child2Genome);
          child1Genome.mutate(mutationRate);
          child2Genome.mutate(mutationRate);
          let extraCreature1 = new Creature(
              {
                headPos: {
                  x: getRandomFromRange(0, config.canvas.width),
                  y: getRandomFromRange(0, config.canvas.height),
                },
                bodyPos: {
                  x: getRandomFromRange(0, config.canvas.width),
                  y: getRandomFromRange(0, config.canvas.height),
                },
                c: hues[getRandomFromRange(0, hues.length)],
              },
              child1Genome
            ),
            extraCreature2 = new Creature(
              {
                headPos: {
                  x: getRandomFromRange(0, config.canvas.width),
                  y: getRandomFromRange(0, config.canvas.height),
                },
                bodyPos: {
                  x: getRandomFromRange(0, config.canvas.width),
                  y: getRandomFromRange(0, config.canvas.height),
                },
                c: hues[getRandomFromRange(0, hues.length)],
              },
              child2Genome
            );
          //   console.log("we crossed over");
          newCreatures.push(extraCreature1, extraCreature2);
          config.evolutionTimer = getRandomFromRange(
            config.evolutionTimer,
            config.evolutionTimer + config.creatures.length
          );
          let evolverArr = range(0.01, 1, 0.01);
          let randomEvolver =
            evolverArr[getRandomFromRange(0, evolverArr.length)];
          config.evolver = randomEvolver;
          randomizeWeights();
        }
        newCreatures.push(newCreature);
      }
      config.generations.push({
        generation: config.generations.length + 1,
        size: newCreatures.length,
      });
      //   console.log(newCreatures.length);
      // Replace old population with new one
      config.creatures = [...newCreatures, ...config.creatures];
    }
  };
  const runMutations = () => {
    config.creatures.map((creature) => {
      let mutationRate = getRandomFloat();
      mutationRate = mutationRate < 0 ? mutationRate * -1 : mutationRate;
      creature.genome.mutate(mutationRate);
    });
  };
  const addCreature = () => {
    let { canvas } = config,
      bodyPos = getRandomFromRange(0, canvas.height),
      headPos = getRandomFromRange(0, canvas.height),
      c = hues[getRandomFromRange(0, hues.length)];
    let genome = getGenome();
    mutationRate = mutationRate < 0 ? mutationRate * -1 : mutationRate;
    genome.mutate(mutationRate);
    console.log(genome.genes);
    config.creatures.push(
      new Creature(
        {
          headPos: { x: headPos, y: headPos },
          bodyPos: { x: bodyPos, y: bodyPos },
          c,
        },
        genome
      )
    );
  };
  const setup = (payload) => {
    for (let key in payload) {
      config[key] = payload[key];
    }
  };
  const getCreatures = () => config.creatures;
  const getData = () => ({
    frames: config.frames,
    creatures: config.creatures,
    evolutionTimer: config.evolutionTimer,
    evolver: config.evolver,
    topCreaturesDivider: config.topCreaturesDivider,
    generations: config.generations,
    detectPoison: config.detectPoison,
  });
  const loop = () => {
    if (config.rAF !== null) {
      if (!config.creatures) initCreatures();
      config.ctx.clearRect(0, 0, config.canvas.width, config.canvas.height);
      updateCreatures();
      if (config.frames % config.evolutionTimer === 0) evolveCreatures();
      config.frames++;
    }
    config.rAF = requestAnimationFrame(loop);
  };
  const start = () => {
    randomizeWeights();
    loop();
  };
  const stop = () => {
    config.food = [];
    config.creatures = [];
    config.frames = 0;
    config.evolutionTimer = 50;
    config.evolver = 0.05;
    cancelAnimationFrame(config.rAF);
    config.rAF = null;
    config.canvas = null;
    config.ctx = null;
    window.location.reload();
  };
  return {
    setup,
    start,
    stop,
    addCreature,
    getCreatures,
    getData,
    runMutations,
  };
})();
