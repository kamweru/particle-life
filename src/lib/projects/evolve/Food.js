import { getRandomFloat } from "../../utils";
import { Vector } from "./Vector";
class Food {
  constructor(x, y, energyRatio, massRatio) {
    this.position = new Vector(x, y);
    this.velocity = new Vector(getRandomFloat(), getRandomFloat());
    this.energy = energyRatio;
    this.mass = massRatio;
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
      this.dead = true;
    }
  }
}

export { Food };
