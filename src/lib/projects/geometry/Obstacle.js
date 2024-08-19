import { Circle, Rectangle } from "../../helpers/ShapeClass";
class Obstacle {
  constructor(payload) {
    this.payload = payload;
    this.init();
  }
  init() {
    let { x, y, w, h, r, c, type } = this.payload;
    if (type === "circle") {
      this.obstacle = new Circle(x, y, r, c);
    }
    if (type === "rectangle") {
      this.obstacle = new Rectangle(x, y, w, h, c);
    }
  }

  draw(ctx) {
    this.obstacle.draw(ctx);
  }
}

export { Obstacle };
