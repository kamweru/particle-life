import { Food } from "./Food";
import { Farm } from "./Farm";
import { Seeds } from "./Seeds";
import { ProcessedWaste } from "./ProcessedWaste";
import { Waste } from "./Waste";
import { OvalCreature } from "./OvalCreature";
import { getRandomFloat, getRandomFromRange } from "../../utils";
class Environment {
  constructor(canvas) {
    this.canvas = canvas;
    this.width = 300;
    this.height = canvas.height - 10;
    this.numOvalCreatures = 20;
    this.creatures = [];
    this.arr = [
      {
        mapClass: Food,
        classObj: undefined,
        circles: [
          {
            c: 27,
            r: 15,
            x: 0,
            y: 0,
          },
          {
            c: 113,
            r: 15,
            x: 0,
            y: 0,
          },
        ],
      },
      {
        mapClass: Farm,
        classObj: undefined,
        circles: [
          {
            c: 21,
            r: 15,
            x: 0,
            y: 0,
          },
          {
            c: 57,
            r: 15,
            x: 0,
            y: 0,
          },
          {
            c: 100,
            r: 15,
            x: 0,
            y: 0,
          },
        ],
      },
      {
        mapClass: Seeds,
        classObj: undefined,
        circles: [
          {
            c: 8,
            r: 15,
            x: 0,
            y: 0,
          },
          {
            c: 200,
            r: 15,
            x: 0,
            y: 0,
          },
          {
            c: 279,
            r: 15,
            x: 0,
            y: 0,
          },
        ],
      },
      {
        mapClass: ProcessedWaste,
        classObj: undefined,
        circles: [
          {
            c: 113,
            r: 15,
            x: 0,
            y: 0,
          },
          {
            c: 172,
            r: 15,
            x: 0,
            y: 0,
          },
        ],
      },
      {
        mapClass: Waste,
        classObj: undefined,
        circles: [
          {
            c: 290,
            r: 15,
            x: 0,
            y: 0,
          },
          {
            c: 230,
            r: 15,
            x: 0,
            y: 0,
          },
        ],
      },
    ];
  }
  init = () => {
    for (let i = 0; i < this.numOvalCreatures; i++) {
      this.creatures[i] = new OvalCreature({
        x: getRandomFromRange(0, this.canvas.width),
        y: getRandomFromRange(0, this.canvas.height),
        r1: getRandomFromRange(4, 8),
        r2: getRandomFromRange(10, 16),
        c: 120 + i * 10,
        canvas: this.canvas,
      });
    }
    for (let i = 0; i < this.arr.length; i++) {
      let height = this.height / this.arr.length,
        rect = { x: 1, y: 1 + i * height, w: this.width, h: height };
      let { mapClass: MapClass, circles: circles } = this.arr[i];
      this.drawRectangleAndCircles(
        0,
        0 + i * height,
        this.width,
        height,
        circles
      );
      this.arr[i].classObj = new MapClass(circles, rect);
    }
  };
  update = () => {
    this.draw();
    let ctx = this.canvas.getContext("2d");
    for (let i = 0; i < this.creatures.length; i++) {
      this.creatures[i].update();
      this.creatures[i].draw();
    }
    for (let i = 0; i < this.arr.length; i++) {
      this.arr[i].classObj.draw(ctx);
    }
  };
  draw = () => {
    let ctx = this.canvas.getContext("2d");
    ctx.globalAlpha = 0.75;
    ctx.fillStyle = "rgba(36, 38, 45, 1)";
    ctx.clearRect(0, 0, ctx.canvas.width, ctx.canvas.height);
    ctx.fillRect(0, 0, ctx.canvas.width, ctx.canvas.height);
    ctx.globalAlpha = 1;
    // ctx.fillStyle = "hsla(213, 31%, 81%, 1)";
    // ctx.beginPath();
    // ctx.arc(800, 375, 100, 0, 2 * Math.PI);
    // ctx.fill();
  };

  drawRectangleAndCircles(rectX, rectY, rectWidth, rectHeight, circles) {
    let totalCirclesHeight = 0;
    circles.map((c) => {
      totalCirclesHeight += c.r * 2;
    });
    const availableHeight = rectHeight - totalCirclesHeight;
    const margin = availableHeight / 2;
    const verticalSpacing = availableHeight / circles.length;
    for (let i = 0; i < circles.length; i++) {
      let circle = circles[i];
      const circleY = rectY + margin + circle.r + i * verticalSpacing,
        circleX = rectX + rectWidth;
      circle.x = circleX;
      circle.y = circleY;
    }
  }
}
export const Evolve = (() => {
  const config = {};

  const init = () => {
    config.environment = new Environment(config.canvas);
    config.environment.init();
  };

  const loop = () => {
    config.environment.update();
    config.rAF = requestAnimationFrame(loop);
  };

  const start = () => {
    init();
    loop();
  };
  const setup = (params) => {
    for (let key in params) {
      config[key] = params[key];
    }
  };
  return {
    setup,
    start,
  };
})();
