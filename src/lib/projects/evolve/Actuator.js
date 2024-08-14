import { Vector } from "./Vector";
class Actuator {
  constructor(x, y, r, c, action) {
    this.position = new Vector(x, y);
    this.r = r;
    this.c = c;
    this.action = action;
    this.active = false;
  }

  actuate = () => {
    this.active = !this.active;
  };

  draw = (ctx) => {
    ctx.fillStyle = this.active
      ? `hsla(${this.c}, 100%, 50%, 1)`
      : "hsla(120, 0%, 80%, 1)";
    ctx.beginPath();
    ctx.arc(this.position.x, this.position.y, this.r, 0, 2 * Math.PI);
    ctx.closePath();
    ctx.fill();
  };
}

export { Actuator };
