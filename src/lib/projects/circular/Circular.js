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
  constructor(headPos, headRadius, bodyPos, bodyRadius, c) {
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
    this.wanderTimeStep = 0.5;
    this.wanderAngle = getRandomFromRange(0, 360);
    this.avoidance = 150;
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
    if (this.energy < this.maxEnergy * 0.5 && this.mass > this.maxMass * 0.5) {
      const massToConvert = this.mass * this.massToEnergyConversionRate;
      this.mass -= massToConvert;
      this.energy += massToConvert * 10;
    }
  }
  getMaxSpeed() {
    return this.maxVelocity / (1 + this.mass / 10);
  }
  getEnergyConsumption() {
    const speed = this.velocity.magnitude();
    return (speed * this.mass) / 20;
  }
  update = () => {
    this.convertMassToEnergy();
    this.energy -= this.getEnergyConsumption() + this.baseEnergyConsumption;
    this.velocity.add(this.acceleration);
    this.velocity.limit(this.getMaxSpeed());
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
    }
    this.wander();
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
    let count = 0;
    if (dist <= this.head.radius) {
      this.eating = true;
      const energyGain = food.energy * 0.2 * (1 - this.energy / this.maxEnergy);
      const massGain = food.mass * 0.2 * (1 - this.mass / this.maxMass);
      this.energy = Math.min(this.maxEnergy, this.energy + energyGain);
      this.mass = Math.min(this.maxMass, this.mass + massGain);
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
      let desiredVelocity = new Vector(this.maxVelocity, this.velocity.y);
      desiredVelocity
        .normalize()
        .multiply(this.maxVelocity)
        .subtract(this.velocity)
        .limit(this.maxForce * 3);
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
    let bodyDist = this.body.position.dist(otherCreature.body.position);
    let headDist = this.head.position.dist(otherCreature.head.position);
    if (
      bodyDist < this.body.radius + otherCreature.body.radius ||
      headDist < this.head.radius + otherCreature.head.radius
    ) {
      let avoid = otherCreature.body.position
        .copy()
        .subtract(this.body.position)
        .normalize()
        .multiply(this.avoidance);
      let avoid1 = this.body.position
        .copy()
        .add(otherCreature.body.position)
        .normalize()
        .multiply(otherCreature.avoidance);
      // .negate();
      this.body.position.add(avoid);
      otherCreature.body.position.add(avoid1);
      //   this.applyForce(avoid);
    }
    // if (headDist < this.head.radius + otherCreature.head.radius) {
    //   let avoid = otherCreature.head.position
    //     .copy()
    //     .subtract(this.head.position)
    //     .normalize()
    //     .multiply(this.avoidance);
    //   let avoid1 = this.head.position
    //     .copy()
    //     .subtract(otherCreature.head.position)
    //     .normalize()
    //     .multiply(otherCreature.avoidance);
    //   // .negate();
    //   this.head.position.add(avoid);
    //   otherCreature.head.position.add(avoid1);
    //   //   this.applyForce(avoid);
    // }
    // const distBodyBody = Math.hypot(
    //   this.body.position.x - otherCreature.body.position.x,
    //   this.body.position.y - otherCreature.body.position.y
    // );
    // const minDistBodyBody =
    //   this.body.radius + otherCreature.body.radius + this.avoidance;

    // if (distBodyBody < minDistBodyBody) {
    //   const separationForce = new Vector(
    //     this.body.position.x - otherCreature.body.position.x,
    //     this.body.position.y - otherCreature.body.position.y
    //   )
    //     .normalize()
    //     .multiply(this.avoidance);
    //   this.velocity.add(separationForce);
    //   otherCreature.velocity.subtract(separationForce.multiply(20));
    //   this.velocity.limit(this.maxVelocity);
    //   otherCreature.velocity.limit(this.maxVelocity);
    //   this.eating = false;
    //   otherCreature.eating = false;
    //   this.body.position.add(this.velocity);
    //   otherCreature.body.position.add(otherCreature.velocity);
    // }
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
  const config = { numCreatures: 1, numFood: 35, frames: 0 };
  const initCreatures = () => {
    const creatures = [],
      foodArr = [],
      { canvas } = config;
    for (let i = 0; i < config.numCreatures; i++) {
      let bodyPos = getRandomFromRange(0, canvas.height),
        headPos = getRandomFromRange(0, canvas.height),
        c = getRandomFromRange(0, 360);
      creatures.push(
        new Creature(
          { x: headPos, y: headPos },
          10,
          { x: bodyPos, y: bodyPos },
          20,
          c
        )
      );
    }
    for (let i = 0; i < config.numFood; i++) {
      if (config.numFood < config.numCreatures) {
        const food = new Food(
          getRandomFromRange(0, canvas.width),
          getRandomFromRange(0, canvas.height),
          getRandomFromRange(10, 50),
          getRandomFromRange(10, 50)
        );
        foodArr.push(food);
      }
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
      if (creature.dead) {
        config.creatures.splice(i, 1);
        i--;
      }
      creature.update();
      creature.draw(config.ctx);
      creature.nearbyFood(config.food);
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
  };
  const addCreature = () => {
    let { canvas } = config,
      bodyPos = getRandomFromRange(0, canvas.height),
      headPos = getRandomFromRange(0, canvas.height),
      c = getRandomFromRange(0, 360);
    config.creatures.push(
      new Creature(
        { x: headPos, y: headPos },
        10,
        { x: bodyPos, y: bodyPos },
        20,
        c
      )
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
