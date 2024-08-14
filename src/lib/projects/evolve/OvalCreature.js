import { Vector } from "./Vector";
import { getRandomFloat, getRandomFromRange } from "../../utils";
class OvalCreature {
  constructor(payload) {
    let { x, y, r1, r2, c, canvas } = payload;
    this.canvas = canvas;
    this.ctx = canvas.getContext("2d");
    this.position = new Vector(x, y);
    this.r1 = r1 * 0.6125;
    this.r2 = r2 * 1.6125;
    this.c = c;
    this.velocity = new Vector(0, 0);
    this.acceleration = new Vector(0, 0);
    this.wanderAngle = getRandomFromRange(0, 360);
    this.seeRange = getRandomFromRange(60, 80);
    this.smellRange = getRandomFromRange(60, 80);
    this.maxForce = 5;
    this.maxVelocity = 5;
    this.metabolicRate = 0.8;
    this.energyConversionRate = 0.6;
    this.massConversionRate = 0.3;
    this.wasteConversionRate = 0.1;
    this.energy = getRandomFromRange(100, 400);
    this.mass = getRandomFromRange(100, 400);
    this.waste = 0;
    this.dead = false;
    this.eating = false;
    this.hits = [];
    this.actionInterval = 1;
    this.actionTimer = 0;
    this.threshold = {
      eat: 0.5,
      action: 0.75,
    };
  }

  update = () => {
    this.position.add(this.velocity);
    this.velocity.add(this.acceleration);
    this.velocity.limit(this.maxVelocity);
    this.energy -= this.getEnergyConsumption();
    if (this.energy <= 0) this.dead = true;
    // this.acceleration.multiply(0);
  };

  wander = () => {
    let circleCenter = this.velocity.copy().normalize(),
      displacement = new Vector(0, -1),
      wanderForce = new Vector(0, 0);
    displacement.multiply(1.1);
    displacement.rotateDegs(this.wanderAngle);
    this.wanderAngle += Math.random() * 30 - 15;
    wanderForce = circleCenter.add(displacement);
    wanderForce.multiply(1.4);
    if (this.eating) {
      wanderForce.multiply(0.005);
      console.log(" wanderForce.multiply(0.005);");
    }
    this.applyForce(wanderForce);
  };
  getEnergyConsumption = () => {
    return (
      1 +
      (this.metabolicRate *
        this.mass *
        (this.velocity.magnitude() + this.acceleration.magnitude())) /
        100000
    );
  };
  detectActuator = (actuators) => {
    if (
      this.actionTimer % this.actionInterval === 0 &&
      this.energy > this.energy * this.threshold.action
    ) {
      let nearestActuator = null,
        minDistance = Infinity;
      for (const actuator of actuators) {
        let {
          position: { x, y },
        } = actuator;
        const dist = Math.hypot(this.position.x - x, this.position.y - y);
        if (dist < minDistance) {
          minDistance = dist;
          nearestActuator = actuator;
        }
      }
      if (nearestActuator) {
        if (this.position.dist(nearestActuator.position) < nearestActuator.r) {
          nearestActuator.actuate();
          let actuator = {
            action: nearestActuator.action,
            title: nearestActuator.title,
          };
          this.hits.push(actuator);
        }
        // else {
        //   this.follow(nearestActuator, nearestActuator.r);
        // }
      }
    }
    this.actionTimer++;
  };
  detectFood = (qtree, view) => {
    let foods = qtree.searchFood(view),
      record = Infinity,
      closest = -1;
    for (let i = 0; i < foods.length; i++) {
      let dist = this.position.dist(foods[i].position);
      if (dist < record) {
        record = dist;
        closest = i;
      }
    }
    if (record <= Math.pow(this.smellRange, 2)) {
      if (record < this.r1 + this.r2 + foods[closest].r) {
        this.eating = true;
        this.eat(foods[closest]);
      } else if (foods.length > 0) {
        this.chase(foods[closest]);
        console.log("this.chase(foods[closest]);");
      }
    }
  };
  look = (list, radius, angle) => {
    let neighbors = [];
    for (let item of list) {
      if (item != this) {
        let diff = this.position.copy().subtract(item.position),
          dist = this.position.dist(item.position),
          a = this.velocity.angleBetween(diff);
        if (dist < radius && (a < angle / 2 || a > Math.PI - angle / 2)) {
          neighbors.push(item);
        }
      }
    }
    return neighbors;
  };
  follow = (target, arrive) => {
    let dest = target.position.copy().subtract(this.position),
      d = dest.dist(this.position);
    if (d < arrive) dest.setMagnitude((d / arrive) * this.maxVelocity);
    else dest.setMagnitude(this.maxVelocity);
    this.applyForce(dest.limit(this.maxForce * 2));
  };
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
  eat = (food) => {
    if (this.energy < this.energy * this.threshold.eat) {
      this.eating = true;
      this.energy += food.energy;
      this.mass += food.mass;
      food.dead = true;
      console.log("eating");
      // this.eating = false;
    }
  };
  boundaries = () => {
    const buffer = 50,
      canvas = this.canvas;
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
  // boundaries = () => {
  //   let canvas = this.canvas;
  //   const buffer = 25;
  //   let desiredVelocity = this.velocity.copy().normalize();
  //   if (this.position.x < buffer + 300) {
  //     desiredVelocity = new Vector(this.maxForce * 10, this.velocity.y);
  //   }
  //   if (this.position.x > canvas.width - buffer) {
  //     desiredVelocity = new Vector(-this.maxForce * 10, this.velocity.y);
  //   }
  //   if (this.position.y < buffer) {
  //     desiredVelocity = new Vector(this.velocity.x, this.maxForce * 10);
  //   }
  //   if (this.position.y > canvas.height - buffer) {
  //     desiredVelocity = new Vector(this.velocity.x, -this.maxForce * 10);
  //   }
  //   this.applyForce(desiredVelocity);
  // };

  applyForce = (force) => {
    this.acceleration.add(force);
  };

  draw = () => {
    let ctx = this.ctx;
    ctx.fillStyle = `hsla(${this.c}, 100%, 50%, 1)`;
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
    ctx.fill();
  };
}

export { OvalCreature };
