import { getRandomFloat, getRandomFromRange } from "../../utils";
import { Vector } from "./Vector";
import { QuadTree } from "./QuadTree";
import { Rectangle } from "./Rectangle";
import { Circle } from "./Circle";
class Food {
  constructor(x, y, energy) {
    this.position = new Vector(x, y);
    this.velocity = new Vector(getRandomFloat(), getRandomFloat());
    this.energy = energy;
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
    this.position.add(this.velocity);
    if (
      this.position.x > environment.width ||
      this.position.x < 0 ||
      this.position.y > environment.height ||
      this.position.y < 0
    ) {
      this.energy = 0;
      this.dead = true;
    }
  }
}

class Organism {
  constructor(x, y, r) {
    this.position = new Vector(x, y);
    this.r = r;
    this.r1 = this.r * 0.6125;
    this.r2 = this.r * 1.6125;
    this.dead = false;
    this.c = `hsl(176, 100%, 50%)`;
    this.velocity = new Vector(0, 0);
    this.acceleration = new Vector(0, 0);
    this.smellRange = getRandomFromRange(60, 80);
    this.wanderAngle = getRandomFromRange(0, 360);
    this.maxForce = 5;
    this.maxVelocity = 5;
    this.eating = false;
  }
  update() {
    this.position.add(this.velocity);
    this.velocity.add(this.acceleration);
    this.velocity.limit(this.maxVelocity);
  }
  wander = () => {
    let center = this.velocity.copy();
    center.normalize();
    center.multiply(2);
    let displacement = new Vector(0, -1);
    displacement.multiply(1);
    displacement.rotateDegs(this.wanderAngle);
    this.wanderAngle += Math.random() * 30 - 15;
    let force = new Vector(0, 0);
    force = center.add(displacement);
    force.multiply(1.4);
    if (this.eating) force.multiply(0.005);
    this.applyForce(force);
  };
  applyForce = (force) => {
    this.acceleration.add(force);
  };
  findFood(qtree, circle) {
    this.eating = false;
    let foods = qtree.searchFood(
        new Circle(this.position.x, this.position.y, this.smellRange)
      ),
      record = Infinity,
      closest = -1;
    for (let i = foods.length - 1; i >= 0; i--) {
      let dist =
        Math.pow(this.position.x - foods[i].position.x, 2) +
        Math.pow(this.position.y - foods[i].position.y, 2);
      if (dist < record) {
        record = dist;
        closest = i;
      }
    }
    if (record <= Math.pow(this.smellRange, 2) && foods[closest]) {
      if (record < this.r1 + this.r2 + foods[closest].r) {
        this.eating = true;
        foods[closest].dead = true;
      } else {
        if (foods.length !== 0) {
          this.chase(foods[closest]);
        }
      }
    }
  }
  chase = (target) => {
    let lookAheadTime = 0.5;
    let predictedPosition = target.position
      .copy()
      .add(target.velocity.copy().multiply(lookAheadTime));
    let desiredSpeed = predictedPosition.subtractNew(this.position);
    desiredSpeed.setMagnitude(this.maxVelocity);
    let steering = desiredSpeed.subtractNew(this.velocity);
    steering.limit(this.maxForce);
    this.applyForce(steering);
  };
  boundaries = (canvas) => {
    const buffer = 50;
    if (this.position.x - Math.max(this.r1, this.r2) < buffer) {
      this.applyForce(new Vector(this.maxForce * 3, 0));
    }
    if (this.position.x + Math.max(this.r1, this.r2) > canvas.width - buffer) {
      this.applyForce(new Vector(-this.maxForce * 3, 0));
    }
    if (this.position.y - Math.max(this.r1, this.r2) < buffer) {
      this.applyForce(new Vector(0, this.maxForce * 3));
    }
    if (this.position.y + Math.max(this.r1, this.r2) > canvas.height - buffer) {
      this.applyForce(new Vector(0, -this.maxForce * 3));
    }
  };
  draw(ctx) {
    if (this.dead) return;
    ctx.fillStyle = this.c;
    ctx.beginPath();
    ctx.ellipse(
      this.position.x,
      this.position.y,
      this.r1,
      this.r2,
      this.velocity.headingRads() - Math.PI / 2,
      0,
      2 * Math.PI
    );
    ctx.closePath();
    ctx.fill();
  }
}

export const Propeller = (() => {
  const config = {
    numFood: 100,
    foods: [],
    organisms: [],
    numOrganisms: 20,
    rectangle: undefined,
    qtree: null,
  };
  const init = () => {
    [...Array(config.numFood).keys()].map(() => {
      let food = new Food(
        getRandomFromRange(0, config.canvas.width),
        getRandomFromRange(0, config.canvas.height),
        getRandomFromRange(20, 60)
      );
      config.foods.push(food);
      config.qtree.insertFood(food);
    });
    [...Array(config.numOrganisms).keys()].map(() => {
      let organism = new Organism(
        getRandomFromRange(0, config.canvas.width),
        getRandomFromRange(0, config.canvas.height),
        getRandomFromRange(8, 12)
      );
      config.organisms.push(organism);
      config.qtree.insertOrganism(organism);
    });
  };
  const drawAll = () => {
    config.organisms.forEach((organism) => {
      organism.draw(config.ctx);
    });
    config.foods.forEach((food) => {
      food.draw(config.ctx);
    });
    config.qtree.draw(config.ctx);
  };
  const update = () => {
    qtreeSetup();
    for (let i = 0; i < config.organisms.length; i++) {
      config.organisms[i].update();
      config.organisms[i].wander();
      config.organisms[i].boundaries(config.canvas);
    }
    for (let i = 0; i < config.foods.length; i++) {
      if (config.foods[i].dead) {
        config.foods.splice(i, 1);
        i--;
      } else {
        config.foods[i].update(config.canvas);
      }
    }
    if (config.foods.length < config.numFood) {
      let food = new Food(
        getRandomFromRange(0, config.canvas.width),
        getRandomFromRange(0, config.canvas.height),
        getRandomFromRange(20, 60)
      );
      config.foods.push(food);
    }
    config.organisms.forEach((organism) => {
      config.qtree.insertOrganism(organism);
    });

    config.foods.forEach((food) => {
      config.qtree.insertFood(food);
    });
  };
  function handleCollisionsAndFeeding() {
    let record = Infinity,
      closest = -1;
    for (let organism of config.organisms) {
      let foods = config.qtree.searchFood(
        new Circle(
          organism.position.x,
          organism.position.y,
          organism.smellRange
        )
      );
      for (let i = 0; i < foods.length; i++) {
        let d =
          Math.pow(organism.position.x - foods[i].position.x, 2) +
          Math.pow(organism.position.y - foods[i].position.y, 2);
        if (d < record) {
          record = d;
          closest = i;
        }
      }
      if (record <= Math.pow(organism.smellRange, 2) && foods[closest]) {
        if (record < organism.r1 + organism.r2 + foods[closest].r) {
          organism.eating = true;
          foods[closest].dead = true;
        } else {
          if (foods.length !== 0) {
            organism.chase(foods[closest]);
          }
        }
      }
    }
  }
  const qtreeSetup = () => {
    let halfWidth = config.canvas.width / 2,
      halfHeight = config.canvas.height / 2;
    config.rectangle = new Rectangle(
      halfWidth,
      halfHeight,
      halfWidth,
      halfHeight
    );
    config.qtree = new QuadTree(config.rectangle, 10);
  };
  const loop = () => {
    let { ctx } = config;
    ctx.globalAlpha = 0.75;
    ctx.fillStyle = "rgba(36, 38, 45, 1)";
    ctx.clearRect(0, 0, ctx.canvas.width, ctx.canvas.height);
    ctx.fillRect(0, 0, ctx.canvas.width, ctx.canvas.height);
    ctx.globalAlpha = 1;
    update();
    handleCollisionsAndFeeding();
    drawAll();
    config.rAF = requestAnimationFrame(loop);
  };
  const setup = (payload) => {
    for (let key in payload) {
      config[key] = payload[key];
    }
    qtreeSetup();
    init();
    loop();
  };
  return {
    setup,
  };
})();
