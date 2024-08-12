import { Vector } from "./Vector";
import { getRandomFloat } from "../../utils";
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
    this.wanderAngle = Math.random() * 360;
    this.maxForce = 10;
    this.maxVelocity = 5;
  }

  update = () => {
    this.position.add(this.velocity);
    this.velocity.add(this.acceleration);
    this.velocity.limit(this.maxVelocity);
    this.wander();
    this.boundaries();
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
    this.applyForce(wanderForce);
  };

  boundaries = () => {
    let canvas = this.canvas;
    const buffer = 25;
    let desiredVelocity = this.velocity.copy().normalize();
    if (this.position.x < buffer + 300) {
      desiredVelocity = new Vector(this.maxForce * 10, this.velocity.y);
    }
    if (this.position.x > canvas.width - buffer) {
      desiredVelocity = new Vector(-this.maxForce * 10, this.velocity.y);
    }
    if (this.position.y < buffer) {
      desiredVelocity = new Vector(this.velocity.x, this.maxForce * 10);
    }
    if (this.position.y > canvas.height - buffer) {
      desiredVelocity = new Vector(this.velocity.x, -this.maxForce * 10);
    }
    this.applyForce(desiredVelocity);
  };

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
