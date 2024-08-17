import { getRandomFromRange } from "../../utils";
import { Vector } from "./Vector";
class Agent {
  constructor(x, y, genome) {
    this.position = new Vector(x, y);
    this.genome = genome;
    this.velocity = new Vector(0, 0);
    this.acceleration = new Vector(0, 0);
    this.wanderAngle = getRandomFromRange(0, 360);
    this.maxSpeed = 3.8; // Cap the speed to slow down the agents
    this.maxForce = 5;
    this.r = 5;
    this.c = 173;
  }

  update(target) {
    const input = [
      this.position.x - target.position.x,
      this.position.y - target.position.y,
    ];
    const output = this.genome.network.feedForward(input);

    this.position.add(this.velocity);
    this.velocity.add(this.acceleration);
    this.velocity.limit(this.maxSpeed);

    this.control(output);
  }

  wander = () => {
    let circleCenter = this.velocity.copy().normalize(),
      displacement = new Vector(0, -1),
      wanderForce = new Vector(0, 0);
    displacement.multiply(1.1);
    displacement.rotateDegs(this.wanderAngle);
    this.wanderAngle += Math.random() * 30 - 15;
    wanderForce = circleCenter.add(displacement);
    wanderForce.multiply(1.4);
    // if (this.eating) {
    //   wanderForce.multiply(0.005);
    // console.log(" wanderForce.multiply(0.005);");
    // }
    this.applyForce(wanderForce);
  };
  applyForce = (force) => {
    this.acceleration.add(force);
  };

  control = (output) => {
    // Output control signals for movement
    const steeringForce = new Vector(
      (output[0] * 2 - 1) * this.maxForce,
      (output[1] * 2 - 1) * this.maxForce
    );
    this.applyForce(steeringForce);
  };
  draw(ctx) {
    ctx.beginPath();
    // ctx.arc(this.position.x, this.position.y, this.r, 0, Math.PI * 2);
    ctx.ellipse(
      this.position.x,
      this.position.y,
      this.r,
      this.r * 1.625,
      this.velocity.headingRads() - Math.PI / 2,
      0,
      2 * Math.PI
    );
    ctx.fillStyle = `hsla(${this.c}, 100%, 50%, 1)`;
    ctx.fill();
    ctx.closePath();
  }
}

export { Agent };
