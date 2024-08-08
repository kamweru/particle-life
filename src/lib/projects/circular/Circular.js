import { getRandomFloat, getRandomFromRange } from "../../utils";
import { Vector } from "./Vector";
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
class Head {
  constructor(payload) {
    this.position = new Vector(payload.x, payload.y);
    this.r = payload.r;
    this.c = payload.c;
  }
  update(payload) {
    this.position = payload.position;
  }
  draw(ctx) {
    ctx.fillStyle = this.c;
    ctx.beginPath();
    ctx.arc(this.position.x + 40, this.position.y, this.r, 0, 2 * Math.PI);
    ctx.closePath();
    ctx.fill();
  }
}
class Body {
  constructor(payload) {
    this.position = new Vector(payload.x, payload.y);
    this.r = payload.r;
    this.c = payload.c;
  }
  update(payload) {
    this.position = payload.position;
  }
  draw(ctx) {
    ctx.fillStyle = this.c;
    ctx.beginPath();
    ctx.arc(this.position.x, this.position.y, this.r, 0, 2 * Math.PI);
    ctx.closePath();
    ctx.fill();
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
  constructor(headPos, headRadius, bodyPos, bodyRadius) {
    this.head = {
      position: new Vector(headPos.x, headPos.y),
      radius: headRadius,
      c: "hsl(172, 100%, 50%)",
    };
    this.body = {
      position: new Vector(bodyPos.x, bodyPos.y),
      radius: bodyRadius,
      c: "hsl(172, 100%, 50%)",
    };
    this.velocity = new Vector(0, 0);
    this.acceleration = new Vector(0, 0);
    this.wandering = new Vector(getRandomFloat(), getRandomFloat());
    this.wanderTimeStep = 0.5;
    this.wanderAngle = getRandomFromRange(0, 360);
    this.avoidance = 50;
    this.smellRadius = 50;
    this.maxForce = 0.5;
    this.maxVelocity = 5;
    this.mass = 500;
    this.energy = 500;
    this.maxEnergy = 1000;
    this.maxMass = 1000;
    this.dead = false;
    this.eating = false;
    this.baseEnergyConsumption = 0.1;
    this.massToEnergyConversionRate = 0.05;
  }
  convertMassToEnergy() {
    if (this.energy < this.maxEnergy * 0.2 && this.mass > this.maxMass * 0.5) {
      // Calculate the amount of mass to convert
      const massToConvert = this.mass * this.massToEnergyConversionRate;
      this.mass -= massToConvert;

      // Increase energy based on the converted mass
      this.energy += massToConvert * 10; // Adjust the multiplier as needed

      //   console.log(`Converted ${massToConvert} mass into energy.`);
    }
  }
  getMaxSpeed() {
    return this.maxVelocity / (1 + this.mass / 10);
  }
  getEnergyConsumption() {
    // Calculate energy consumption based on velocity and mass
    const speed = this.velocity.magnitude();
    // console.log(speed);
    return (speed * this.mass) / 100;
  }
  update = () => {
    // if (!this.eating) {
    this.convertMassToEnergy();
    this.energy -= this.getEnergyConsumption() + this.baseEnergyConsumption;
    this.velocity.add(this.acceleration);
    this.velocity.limit(this.getMaxSpeed());

    //   console.log(this.getEnergyConsumption());
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
    //   this.head.position.x =
    //     this.body.position.x +
    //     Math.cos(this.velocity.angle()) * (this.body.radius + this.head.radius);
    //   this.head.position.y =
    //     this.body.position.y +
    //     Math.sin(this.velocity.angle()) * (this.body.radius + this.head.radius);
    // console.log("this.getMaxSpeed()", this.getMaxSpeed());
    this.acceleration.multiply(0);
    this.wander();
    // }
  };

  wander = () => {
    if (Math.random() < 0.05) {
      this.wandering.rotate(Math.PI * 2 * Math.random());
    }
    this.wandering.normalize();
    // let center = this.wandering.copy().normalize(),
    //   displacement = new Vector(0, -1),
    //   wanderForce = new Vector(0, 0);
    // displacement.multiply(10);
    // displacement.rotateDegs(this.wanderAngle);
    // this.wanderAngle += Math.random() * 30 - 15;
    // wanderForce = center.add(displacement).multiply(10);
    if (this.eating) {
      this.wandering.multiply(0.0005);
      this.applyForce(this.wandering);
    } else {
      this.wandering.multiply(this.wanderTimeStep);
      this.applyForce(this.wandering);
    }
    // this.wandering.normalize();
    // this.acceleration.add(this.wandering);
    // this.velocity.add(this.acceleration.multiply(this.wanderTimeStep));
    // this.velocity.limit(this.maxVelocity);
    // // add the velocity to the body position
    // this.body.position.add(this.velocity);
    // this.acceleration.set(0, 0);
    // // update the head position
    // this.head.position.x =
    //   this.body.position.x +
    //   Math.cos(this.velocity.angle()) * (this.body.radius + this.head.radius);
    // this.head.position.y =
    //   this.body.position.y +
    //   Math.sin(this.velocity.angle()) * (this.body.radius + this.head.radius);
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
      //   if (this.mass < this.maxMass) {
      this.eat(nearestFood);
      //   } else if (this.mass > this.maxMass) {
      //     this.eating = false;
      //     this.mass = this.maxMass;
      //   }
      //   console.log(
      //     "this.energy",
      //     this.energy,
      //     "this.mass",
      //     this.mass,
      //     "this.getMaxSpeed()",
      //     this.getMaxSpeed()
      //   );
    }
    // else {
    // console.log("wtf");
    // this.wander();
    // }
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
      //   console.log("wtf");
      return;
    }
    // this.body.position.add(this.velocity);
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
    // Consume energy based on movement
    if (dist <= this.head.radius) {
      this.eating = true;
      // Calculate the amount of energy and mass to gain
      const energyGain = food.energy * 0.2 * (1 - this.energy / this.maxEnergy);
      const massGain = food.mass * 0.2 * (1 - this.mass / this.maxMass);

      // Increase the creature's energy and mass, capped by max values
      this.energy = Math.min(this.maxEnergy, this.energy + energyGain);
      this.mass = Math.min(this.maxMass, this.mass + massGain);

      //   this.mass += food.mass;
      //   this.energy += food.energy;
      food.dead = true;
      //   this.eating = false;
      //   console.log("is eating");
    } else {
      this.eating = false;
      //   console.log("not eating");
    }
  };
  boundaries = (canvas) => {
    const buffer = 50,
      { width, height } = canvas;
    if (
      this.head.position.x + this.head.radius < buffer ||
      this.body.position.x + this.body.radius < buffer
    ) {
      let desiredVelocity = new Vector(this.maxVelocity, this.velocity.y);
      desiredVelocity
        .normalize()
        .multiply(this.maxVelocity)
        .subtract(this.velocity)
        .limit(this.maxVelocity * 3);
      this.applyForce(desiredVelocity);
    }
    if (
      this.head.position.x > width - buffer ||
      this.body.position.x > width - buffer
    ) {
      let desiredVelocity = new Vector(-this.maxVelocity, this.velocity.y);

      desiredVelocity
        .normalize()
        .multiply(this.maxVelocity)
        .subtract(this.velocity)
        .limit(this.maxVelocity * 3);
      this.applyForce(desiredVelocity);
    }
    if (
      this.head.position.y + this.head.radius < buffer ||
      this.body.position.y + this.body.radius < buffer
    ) {
      let desiredVelocity = new Vector(this.velocity.x, this.maxVelocity);

      desiredVelocity
        .normalize()
        .multiply(this.maxVelocity)
        .subtract(this.velocity)
        .limit(this.maxVelocity * 3);
      this.applyForce(desiredVelocity);
    }
    if (
      this.head.position.y > height - buffer ||
      this.body.position.y > height - buffer
    ) {
      let desiredVelocity = new Vector(this.velocity.x, -this.maxVelocity);

      desiredVelocity
        .normalize()
        .multiply(this.maxVelocity)
        .subtract(this.velocity)
        .limit(this.maxVelocity * 3);
      this.applyForce(desiredVelocity);
    }
  };

  handleCollision = (otherCreature) => {
    const distBodyBody = Math.hypot(
      this.body.position.x - otherCreature.body.position.x,
      this.body.position.y - otherCreature.body.position.y
    );
    const minDistBodyBody =
      this.body.radius + otherCreature.body.radius + this.avoidance;

    if (distBodyBody < minDistBodyBody) {
      //   let avoidanceVector = new Vector(
      //     this.body.position.x,
      //     this.body.position.y
      //   );
      //   avoidanceVector
      //     .subtract(
      //       new Vector(
      //         otherCreature.body.position.x,
      //         otherCreature.body.position.y
      //       )
      //     )
      //     .normalize()
      //     .multiply(this.avoidance);
      //   const angle = Math.atan2(
      //     otherCreature.body.position.y - this.body.position.y,
      //     otherCreature.body.position.x - this.body.position.x
      //   );
      //   const oppositeAngle = angle + Math.PI;
      //   this.acceleration.x += Math.cos(oppositeAngle) + avoidanceVector.x;
      //   this.acceleration.y += Math.sin(oppositeAngle) + avoidanceVector.y;
      //   this.velocity.add(this.acceleration);
      //   this.velocity.limit(this.maxVelocity);
      //   this.body.position.x += this.velocity.x;
      //   this.body.position.y += this.velocity.y;
      //   this.acceleration.set(0, 0);
      //   this.head.position.x =
      //     this.body.position.x +
      //     Math.cos(this.velocity.angle()) * (this.body.radius + this.head.radius);
      //   this.head.position.y =
      //     this.body.position.y +
      //     Math.sin(this.velocity.angle()) * (this.body.radius + this.head.radius);

      //   otherCreature.acceleration.x += Math.cos(angle) - avoidanceVector.x;
      //   otherCreature.acceleration.y += Math.sin(angle) - avoidanceVector.y;

      //   otherCreature.velocity.add(otherCreature.acceleration);
      //   otherCreature.velocity.limit(otherCreature.maxVelocity);
      //   otherCreature.body.position.add(otherCreature.velocity);
      //   otherCreature.acceleration.set(0, 0);
      //   otherCreature.head.position.x =
      //     otherCreature.body.position.x +
      //     Math.cos(otherCreature.velocity.angle()) *
      //       (otherCreature.body.radius + otherCreature.head.radius);
      //   otherCreature.head.position.y =
      //     otherCreature.body.position.y +
      //     Math.sin(otherCreature.velocity.angle()) *
      //       (otherCreature.body.radius + otherCreature.head.radius);
      const separationForce = new Vector(
        this.body.position.x - otherCreature.body.position.x,
        this.body.position.y - otherCreature.body.position.y
      )
        .normalize()
        .multiply(this.avoidance);
      // Update velocities to move in opposite directions
      this.velocity.add(separationForce);
      otherCreature.velocity.subtract(separationForce.multiply(2));

      // Limit velocities to max speed
      this.velocity.limit(this.maxVelocity);
      otherCreature.velocity.limit(this.maxVelocity);

      // Disable food search for both creatures
      this.eating = false;
      otherCreature.eating = false;
      this.body.position.add(this.velocity);
      otherCreature.body.position.add(otherCreature.velocity);
      this.velocity.add(separationForce);
      this.velocity.limit(this.maxVelocity);
      this.eating = false;
      otherCreature.eating = false;
      otherCreature.velocity = this.velocity.copy().multiply(-5);
      this.body.position.add(this.velocity);
      otherCreature.body.position.add(otherCreature.velocity);
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
  applyForce = (f) => {
    this.acceleration.add(f).limit(this.maxForce * 1.5);
  };
  draw = (ctx) => {
    ctx.strokeStyle = this.head.c;
    ctx.beginPath();
    ctx.arc(
      this.head.position.x,
      this.head.position.y,
      this.head.radius,
      0,
      2 * Math.PI
    );
    ctx.closePath();
    ctx.stroke();
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

    // Calculate start and end angles for the inner filled arc
    const startAngle = -Math.PI / 2; // Start from the top
    const endAngle = startAngle + (2 * Math.PI * this.energy) / this.maxEnergy;

    // Draw the filled arc within the body
    ctx.fillStyle = "hsl(172, 100%, 50%)"; // Adjust color as needed
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
  };
}

export const Circular = (() => {
  const config = { numCreatures: 1, numFood: 35, frames: 0 };
  const initCreatures = () => {
    const creatures = [],
      foodArr = [],
      { canvas } = config;
    for (let i = 0; i < config.numCreatures; i++) {
      let adder = 10;
      creatures.push(
        new Creature(
          { x: 0 + i * adder, y: 0 + i * adder },
          10,
          { x: 200 + i * adder, y: 200 + i * adder },
          20
        )
      );
    }
    for (let i = 0; i < config.numFood; i++) {
      const food = new Food(
        getRandomFromRange(0, canvas.width),
        getRandomFromRange(0, canvas.height),
        getRandomFromRange(10, 50),
        getRandomFromRange(10, 50)
      );
      foodArr.push(food);
    }
    config.creatures = creatures;
    config.food = foodArr;
  };
  const updateCreatures = () => {
    const { ctx } = config;
    for (let i = 0; i < config.creatures.length; i++) {
      const creature = config.creatures[i];
      creature.update();
      creature.draw(config.ctx);
      creature.nearbyFood(config.food);
      creature.checkCollision(config.creatures);
      creature.boundaries(config.canvas);
      const [t1, t2, t3, t4] = getTangentPoints(creature.head, creature.body);

      ctx.beginPath();
      ctx.strokeStyle = "hsl(172, 100%, 50%)";
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
  };
  const addCreature = () => {
    config.creatures.push(
      new Creature({ x: 0, y: 0 }, 10, { x: 200, y: 200 }, 20)
    );
  };
  const setup = (payload) => {
    for (let key in payload) {
      config[key] = payload[key];
    }
  };
  const getCreatures = () => config.creatures;
  const loop = () => {
    if (!config.creatures) initCreatures();
    config.ctx.clearRect(0, 0, config.canvas.width, config.canvas.height);
    updateCreatures();
    config.frames++;
    config.rAF = requestAnimationFrame(loop);
  };
  const start = () => {
    loop();
  };
  const stop = () => cancelAnimationFrame(config.rAF);
  return { setup, start, stop, addCreature, getCreatures };
})();
