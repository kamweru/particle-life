import { FoodStore } from "./FoodStore";
import { Circle } from "./Circle";
import { Rectangle } from "./Rectangle";
import { Farm } from "./Farm";
import { Seeds } from "./Seeds";
import { ProcessedWaste } from "./ProcessedWaste";
import { Waste } from "./Waste";
import { OvalCreature } from "./OvalCreature";
import { Actuator } from "./Actuator";
import { Food } from "./Food";
import { Vector } from "./Vector";
import { getRandomFloat, getRandomFromRange } from "../../utils";
import { QuadTree } from "./QuadTree";
class Environment {
  constructor(canvas) {
    this.canvas = canvas;
    this.width = 300;
    this.height = canvas.height - 10;
    this.numOvalCreatures = 20;
    this.creatures = [];
    this.foods = [];
    this.arr = [
      {
        mapClass: FoodStore,
        classObj: undefined,
        title: "FoodStore",
        actuators: [],
        circles: [
          {
            x: 0,
            y: 0,
            r: 15,
            c: 27,
            action: "sendToWaste",
          },
          {
            x: 0,
            y: 0,
            r: 15,
            c: 113,
            action: "distribute",
          },
        ],
      },
      {
        mapClass: Farm,
        classObj: undefined,
        title: "Farm",
        actuators: [],
        circles: [
          {
            c: 57,
            r: 15,
            x: 0,
            y: 0,
            action: "sendToWaste",
          },
          // {
          //   c: 57,
          //   r: 15,
          //   x: 0,
          //   y: 0,
          // },
          {
            c: 100,
            r: 15,
            x: 0,
            y: 0,
            action: "harvest",
          },
        ],
      },
      {
        mapClass: Seeds,
        classObj: undefined,
        title: "Seeds",
        actuators: [],
        circles: [
          {
            c: 8,
            r: 15,
            x: 0,
            y: 0,
            action: "plantSeedTypeOne",
          },
          {
            c: 200,
            r: 15,
            x: 0,
            y: 0,
            action: "plantSeedTypeTwo",
          },
          {
            c: 279,
            r: 15,
            x: 0,
            y: 0,
            action: "plantSeedTypeThree",
          },
        ],
      },
      {
        mapClass: ProcessedWaste,
        classObj: undefined,
        title: "ProcessedWaste",
        actuators: [],
        circles: [
          {
            c: 113,
            r: 15,
            x: 0,
            y: 0,
            action: "fertilizeFarm",
          },
          {
            c: 172,
            r: 15,
            x: 0,
            y: 0,
            action: "processWaste",
          },
        ],
      },
      {
        mapClass: Waste,
        classObj: undefined,
        title: "Waste",
        actuators: [],
        circles: [
          {
            c: 290,
            r: 15,
            x: 0,
            y: 0,
            action: "sendToProcessor",
          },
          {
            c: 230,
            r: 15,
            x: 0,
            y: 0,
            action: "addWaste",
          },
        ],
      },
    ];
  }
  init = () => {
    this.qtreeSetup();
    for (let i = 0; i < this.numOvalCreatures; i++) {
      this.creatures[i] = new OvalCreature({
        x: getRandomFromRange(0, this.canvas.width),
        y: getRandomFromRange(0, this.canvas.height),
        r1: getRandomFromRange(8, 12),
        r2: getRandomFromRange(8, 12),
        c: 120 + i * 10,
        canvas: this.canvas,
      });
    }
    [...Array(100).keys()].forEach(() => {
      let food = new Food(
        getRandomFromRange(0, this.canvas.width),
        getRandomFromRange(0, this.canvas.height),
        getRandomFromRange(180, 260),
        getRandomFromRange(180, 260)
      );
      this.foods.push(food);
      this.qtree.insertFood(food);
    });
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
      for (let circle of circles) {
        let { x, y, r, c, action } = circle;
        this.arr[i].actuators.push(new Actuator(x, y, r, c, action));
      }
      this.arr[i].classObj = new MapClass(this.arr[i].actuators, rect);
    }
  };
  handleFeeding = () => {
    let record = Infinity,
      closest = -1;
    for (let creature of this.creatures) {
      let foods = this.qtree.searchFood(
        new Circle(
          creature.position.x,
          creature.position.y,
          creature.smellRange
        )
      );
      for (let i = 0; i < foods.length; i++) {
        let d =
          Math.pow(creature.position.x - foods[i].position.x, 2) +
          Math.pow(creature.position.y - foods[i].position.y, 2);
        if (d < record) {
          record = d;
          closest = i;
        }
      }
      if (record <= Math.pow(creature.smellRange, 2) && foods[closest]) {
        if (record < creature.r1 + creature.r2 + foods[closest].r) {
          // if (creature.energy < creature.energy * creature.threshold.eat) {
          creature.eating = true;
          creature.energy += foods[closest].energy;
          creature.mass += foods[closest].mass;
          foods[closest].dead = true;
          // }

          // foods[closest].dead = true;
          // creature.eat(foods[closest]);
        } else {
          if (foods.length !== 0) {
            creature.chase(foods[closest]);
          }
        }
      }
    }
  };
  qtreeSetup = () => {
    let halfWidth = this.canvas.width / 2,
      halfHeight = this.canvas.height / 2;
    this.rectangle = new Rectangle(
      halfWidth,
      halfHeight,
      halfWidth,
      halfHeight
    );
    this.qtree = new QuadTree(this.rectangle, 10);
  };
  populateQtree = () => {
    for (let i = 0; i < this.foods.length; i++) {
      this.qtree.insertFood(this.foods[i]);
    }
  };
  update = () => {
    let ctx = this.canvas.getContext("2d"),
      actuators = [];
    this.qtreeSetup();
    this.draw();
    for (let i = 0; i < this.arr.length; i++) {
      this.arr[i].actuators.map((actuator) => {
        actuators.push({ ...actuator, title: this.arr[i].title });
      });
      this.arr[i].classObj.update(ctx);
    }
    for (let i = 0; i < this.creatures.length; i++) {
      this.creatures[i].update();
      this.creatures[i].wander();
      this.creatures[i].boundaries();
      // this.creatures[i].detectActuator(actuators);
      // // this.creatures[i].detectFood(
      // //   this.qtree,
      // //   new Circle(
      // //     this.creatures[i].position.x,
      // //     this.creatures[i].position.y,
      // //     this.creatures[i].seeRange
      // //   )
      // // );
      // actuators.map((actuator) => {
      //   if (actuator.active) {
      //     let objIndex = this.arr.findIndex((x) => x.title === actuator.title);
      //     if (
      //       actuator.title === "FoodStore" &&
      //       actuator.action === "distribute"
      //     ) {
      //       this.arr[objIndex].classObj[actuator.action]((res) => {
      //         [...Array(res).keys()].forEach(() => {
      //           this.foods.push(
      //             new Food(
      //               getRandomFromRange(0, this.canvas.width),
      //               getRandomFromRange(0, this.canvas.height),
      //               getRandomFromRange(20, 60),
      //               getRandomFromRange(20, 60)
      //             )
      //           );
      //         });
      //       });
      //     }
      //     actuator.active = false;
      //   }
      // });
      if (this.creatures[i].dead) {
        this.creatures.splice(i, 1);
        i--;
      }
    }
    for (let i = 0; i < this.foods.length; i++) {
      if (this.foods[i].dead) {
        this.foods.splice(i, 1);
        i--;
      } else {
        this.foods[i].update(ctx.canvas);
      }
    }
    this.populateQtree();
    this.qtree.draw(ctx);
    for (let i = 0; i < this.creatures.length; i++) {
      // this.creatures[i].update();
      // this.creatures[i].wander();
      // this.creatures[i].boundaries();
      this.creatures[i].detectActuator(actuators);
      // this.creatures[i].detectFood(
      //   this.qtree,
      //   new Circle(
      //     this.creatures[i].position.x,
      //     this.creatures[i].position.y,
      //     this.creatures[i].seeRange
      //   )
      // );
      actuators.map((actuator) => {
        if (actuator.active) {
          let objIndex = this.arr.findIndex((x) => x.title === actuator.title);
          if (
            actuator.title === "FoodStore" &&
            actuator.action === "distribute"
          ) {
            this.arr[objIndex].classObj[actuator.action]((res) => {
              [...Array(res).keys()].forEach(() => {
                this.foods.push(
                  new Food(
                    getRandomFromRange(0, this.canvas.width),
                    getRandomFromRange(0, this.canvas.height),
                    getRandomFromRange(20, 60),
                    getRandomFromRange(20, 60)
                  )
                );
              });
            });
          }
          actuator.active = false;
        }
      });
    }
    this.handleFeeding();
  };
  draw = () => {
    let ctx = this.canvas.getContext("2d");
    ctx.globalAlpha = 0.75;
    ctx.fillStyle = "rgba(36, 38, 45, 1)";
    ctx.clearRect(0, 0, ctx.canvas.width, ctx.canvas.height);
    ctx.fillRect(0, 0, ctx.canvas.width, ctx.canvas.height);
    ctx.globalAlpha = 1;
    this.foods.forEach((food) => {
      food.draw(ctx);
    });
    this.creatures.forEach((creature) => {
      creature.draw(ctx);
    });
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
