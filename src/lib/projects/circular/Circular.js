import { getRandomFloat, getRandomFromRange } from "../../utils";
import { Vector } from "./Vector";
class Food {
  constructor(x, y, energy) {
    this.position = new Vector(x, y);
    this.velocity = new Vector(getRandomFloat(), getRandomFloat());
    this.energy = energy;
    this.dead = false;
    this.r = 4;
    this.c = `hsl(126, 100%, 50%)`;
    this.isFood = true;
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
  constructor(payload) {
    this.position = new Vector(payload.x, payload.y);
    this.velocity = new Vector(payload.vx, payload.vy);
    this.acceleration = new Vector(0, 0);
    this.r = payload.r;
    this.c = payload.c;
    this.collisionDistance = payload.collisionDistance || 20;
    this.smellRange = payload.smellRange || getRandomFromRange(50, 100);
    this.lookAheadTime = payload.lookAheadTime || getRandomFloat();
    this.maxForce = 0.5;
    this.maxVelocity = 2;
    this.wanderAngle = getRandomFromRange(0, 360);
    this.eating = false;
    this.energy = 1;
    this.dead = false;
    this.body = new Body({
      x: payload.x,
      y: payload.y,
      r: 20,
      c: "hsl(273, 100%, 50%)",
    });
    this.head = new Head({
      x: payload.x,
      y: payload.y,
      r: 10,
      c: "hsla(269, 100%, 50%, 0.5)",
    });
  }

  update = () => {
    this.velocity.add(this.acceleration.limit(this.maxForce));
    this.velocity.limit(this.maxVelocity);
    this.position.add(this.velocity);
    this.body.update({ position: this.position });
    this.head.update({ position: this.position });
    this.acceleration.multiply(0);
    this.wander();
  };
  boundaries(environment) {
    const buffer = 50;
    if (this.position.x < buffer) {
      this.applyForce(new Vector(this.maxForce * 3, 0));
    }
    if (this.position.x > environment.width - buffer) {
      this.applyForce(new Vector(-this.maxForce * 3, 0));
    }
    if (this.position.y < buffer) {
      this.applyForce(new Vector(0, this.maxForce * 3));
    }
    if (this.position.y > environment.height - buffer) {
      this.applyForce(new Vector(0, -this.maxForce * 3));
    }
  }
  avoidCollision(otherCreature) {
    const avoidanceVector = this.position
      .copy()
      .subtract(otherCreature.position)
      .normalize();
    this.applyForce(avoidanceVector);
  }
  checkCollision = (creatures) => {
    for (const otherCreature of creatures) {
      if (this !== otherCreature) {
        const distance = this.position.distanceTo(otherCreature.position);
        if (distance < this.collisionDistance) {
          this.avoidCollision(otherCreature);
        }
      }
    }
    this.position.add(this.velocity);
  };
  findFood = (food) => {
    let nearby = this.search(food, this.smellRange, Math.PI / 2);
    nearby.map((item) => {
      this.chase(item);
      if (this.position.dist(item.position) < item.r + this.head.r) {
        this.eating = true;
        this.eat(item);
      }
    });
  };
  findNearestFood = (foods) => {
    let nearest = {},
      minDistance = Infinity;
    foods.forEach((food) => {
      let distance = Math.sqrt(
        Math.pow(this.body.position.x - food.position.x, 2) +
          Math.pow(this.body.position.y - food.position.y, 2)
      );
      if (distance < minDistance) {
        minDistance = distance;
        nearest = food;
      }
    });
    if (Object.keys(nearest).length > 0) {
      let angle = Math.atan2(
        nearest.position.y - this.body.position.y,
        nearest.position.x - this.body.position.x
      );
      this.position.x += Math.cos(angle) * 2;
      this.position.y += Math.sin(angle) * 2;
      this.head.position.x =
        this.body.position.x + Math.cos(angle) * (this.body.r + this.head.r);
      this.head.position.y =
        this.body.position.y + Math.sin(angle) * (this.body.r + this.head.r);

      const dist = this.position.dist(nearest.position);
      this.chase(nearest);
      if (dist < nearest.r + this.head.r) {
        this.eating = true;
        this.eat(nearest);
      }
    }
  };
  search = (arr, radius, angle) => {
    let nearby = [];
    for (let i in arr) {
      let item = arr[i];
      if (item != this) {
        let diff = this.head.position.copy().subtract(item.position),
          dist = this.head.position.dist(item.position),
          a = this.velocity.angleBetween(diff);
        if (dist < radius && (a < angle / 2 || a > Math.PI - angle / 2)) {
          nearby.push(item);
        }
      }
    }
    return nearby;
  };
  wander = () => {
    let center = this.velocity.copy().normalize(),
      displacement = new Vector(getRandomFloat(), getRandomFloat()),
      wanderForce = new Vector(getRandomFloat(), getRandomFloat());
    displacement.multiply(1).rotateDegs(this.wanderAngle);
    this.wanderAngle += Math.random() * 30 - 15;
    wanderForce.add(center).add(displacement).multiply(getRandomFloat());
    if (this.eating) wanderForce.multiply(0.0002);
    this.applyForce(wanderForce);
  };
  chase = (target) => {
    let predictedPosition = target.position
      .copy()
      .add(target.velocity.copy().multiply(this.lookAheadTime));
    let desiredSpeed = predictedPosition.subtractNew(this.position);
    desiredSpeed.setMagnitude(this.maxVelocity);
    let steering = desiredSpeed.subtractNew(this.velocity);
    steering.limit(this.maxForce);
    this.applyForce(steering);
  };
  eat = (food) => {
    this.energy += food.energy;
    food.dead = true;
  };
  applyForce = (f) => {
    this.acceleration.add(f);
  };
  draw = (ctx) => {
    this.body.draw(ctx);
    this.head.draw(ctx);
  };
}

export const Circular = (() => {
  const config = { numCreatures: 5, numFood: 30, frames: 0 };

  const initCreatures = () => {
    const creatures = [],
      foodArr = [],
      { canvas } = config;
    for (let i = 0; i < config.numCreatures; i++) {
      const creature = new Creature({
        x: getRandomFromRange(0, canvas.width),
        y: getRandomFromRange(0, canvas.height),
        vx: getRandomFloat(),
        vy: getRandomFloat(),
        r: 20,
        c: `hsl(190, 100%, 50%)`,
        collisionDistance: getRandomFromRange(40, 80),
      });
      creatures.push(creature);
    }

    for (let i = 0; i < config.numFood; i++) {
      const food = new Food(
        getRandomFromRange(0, canvas.width),
        getRandomFromRange(0, canvas.height),
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
      creature.boundaries(config.canvas);
      creature.checkCollision(config.creatures);
      creature.findNearestFood(config.food);
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
        getRandomFromRange(1, 5)
      );
      config.food.push(food);
    }
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
  return { setup, start, stop };
})();
