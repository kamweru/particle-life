import { getRandomFloat } from "../../utils";
import { Vector } from "./Vector";
class Food {
  constructor(center, energyRatio, massRatio) {
    this.center = center;
    this.position = new Vector(this.center.x, this.center.y);
    this.velocity = this.generateRadialVelocity();
    this.energy = energyRatio;
    this.mass = massRatio;
    this.dead = false;
    this.r = 4;
    this.c = `hsl(126, 100%, 50%)`;
  }

  generateRadialVelocity() {
    const angle = Math.random() * 2 * Math.PI;
    const speed = getRandomFloat();
    return new Vector(Math.cos(angle) * speed, Math.sin(angle) * speed);
  }

  draw(ctx) {
    if (this.dead) return;
    ctx.fillStyle = this.c;
    ctx.beginPath();
    ctx.arc(this.position.x, this.position.y, this.r, 0, 2 * Math.PI);
    ctx.closePath();
    ctx.fill();

    // ctx.beginPath();
    // ctx.arc(this.center.x, this.center.y, this.center.r, 0, 2 * Math.PI);
    // ctx.closePath();
    // ctx.stroke();
  }

  containsPoint() {
    return (
      Math.sqrt(
        Math.pow(this.position.x - this.center.x, 2) +
          Math.pow(this.position.y - this.center.y, 2)
      ) <= this.center.r
    );
  }
  update() {
    this.position.add(this.velocity);
    if (!this.containsPoint()) {
      this.dead = true;
    }
  }
}

export { Food };
