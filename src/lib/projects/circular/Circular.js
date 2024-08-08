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
    this.wanderTimeStep = 0.1;
    this.wanderAngle = getRandomFromRange(0, 360);
    this.avoidance = 50;
    this.smellRadius = 50;
    this.maxForce = 0.5;
    this.maxVelocity = 5;
    this.mass = 1;
    this.energy = 1;
    this.dead = false;
    this.eating = false;
  }

  update = () => {
    this.velocity.add(this.acceleration);
    this.velocity.limit(this.maxVelocity);
    // this.body.position.add(this.velocity);
    // let headVector = new Vector(
    //   Math.cos(this.velocity.angle()) * (this.body.radius + this.head.radius),
    //   Math.sin(this.velocity.angle()) * (this.body.radius + this.head.radius)
    // );
    // headVector.add(this.body.position);
    // this.head.position = headVector;
    this.acceleration.multiply(0);
    this.wander();
  };

  wander = () => {
    let center = this.wandering.copy().normalize(),
      displacement = new Vector(0, -1),
      wanderForce = new Vector(0, 0);
    displacement.multiply(10);
    displacement.rotateDegs(this.wanderAngle);
    this.wanderAngle += Math.random() * 30 - 15;
    wanderForce = center.add(displacement).multiply(100);
    if (this.eating) {
      wanderForce.multiply(0.0005);
      this.applyForce(wanderForce);
      //   console.log("eating", wanderForce);
      return;
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
      //   console.log("wtf");
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
      this.mass += food.mass;
      this.energy += food.energy;
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
        .limit(this.maxForce * 3);
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
        .limit(this.maxForce * 3);
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
        .limit(this.maxForce * 3);
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
      //   this.velocity.add(separationForce);
      //   this.velocity.limit(this.maxVelocity);
      //   this.eating = false;
      //   otherCreature.eating = false;
      //   otherCreature.velocity = this.velocity.copy().multiply(-5);
      //   this.body.position.add(this.velocity);
      //   otherCreature.body.position.add(otherCreature.velocity);
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
  };
}

export const Circular = (() => {
  const config = { numCreatures: 1, numFood: 30, frames: 0 };
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
        getRandomFromRange(1, 5),
        getRandomFromRange(1, 5)
      );
      foodArr.push(food);
    }
    config.creatures = creatures;
    config.food = foodArr;
  };
  const updateCreatures = () => {
    for (let i = 0; i < config.creatures.length; i++) {
      const creature = config.creatures[i];
      creature.update();
      creature.draw(config.ctx);
      creature.nearbyFood(config.food);
      creature.checkCollision(config.creatures);
      creature.boundaries(config.canvas);
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
        getRandomFromRange(1, 5),
        getRandomFromRange(1, 5)
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
  return { setup, start, stop, addCreature };
})();
