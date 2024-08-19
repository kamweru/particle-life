import { Ellipse, Circle, Rectangle } from "../../helpers/ShapeClass";
import { Population } from "../neuralEvolution/Population";
import { getRandomFromRange } from "../../utils";
export const Environment = (() => {
  const environment = {
    obstacles: [],
    organisms: [],
    populationSize: 10,
    inputNodes: 2,
    hiddenNodes: 4,
    outputNodes: 2,
    obstaclesArr: [
      {
        x: 600,
        y: 110,
        r: 50,
        c: "peru",
        type: "circle",
      },
      {
        x: 600,
        y: 500,
        r: 50,
        c: "gold",
        type: "circle",
      },

      {
        x: 400,
        y: 280,
        r: 50,
        c: "fuchsia",
        type: "circle",
      },
      {
        x: 800,
        y: 280,
        r: 50,
        c: "red",
        type: "circle",
      },
      {
        x: 1280,
        y: 180,
        r: 50,
        c: "aqua",
        type: "circle",
      },

      {
        x: 1280,
        y: 420,
        r: 50,
        c: "lightblue",
        type: "circle",
      },
      {
        x: 50,
        y: 50,
        w: 10,
        h: 500,
        c: "aliceblue",
        type: "rectangle",
      },
      {
        x: 50,
        y: 550,
        w: 1560,
        h: 10,
        c: "aliceblue",
        type: "rectangle",
      },
      {
        x: 50,
        y: 50,
        w: 1560,
        h: 10,
        c: "aliceblue",
        type: "rectangle",
      },
      {
        x: 1600,
        y: 50,
        w: 10,
        h: 500,
        c: "aliceblue",
        type: "rectangle",
      },
    ],
  };
  const setup = (payload) => {
    for (let key in payload) {
      environment[key] = payload[key];
    }
  };
  const init = () => {
    let { populationSize, inputNodes, hiddenNodes, outputNodes } = environment,
      population = new Population(
        populationSize,
        inputNodes,
        hiddenNodes,
        outputNodes
      );
    environment.obstaclesArr.map((o) => {
      let { x, y, r, w, h, c, type } = o;
      if (type === "circle") {
        environment.obstacles.push(new Circle(x, y, r, c));
      }
      if (type === "rectangle") {
        environment.obstacles.push(new Rectangle(x, y, w, h, c));
      }
    });
    population.genomes.map((genome) => {
      environment.organisms.push(
        new Ellipse(
          getRandomFromRange(80, 150),
          getRandomFromRange(50, 550),
          5,
          "deeppink",
          genome
        )
      );
    });
  };
  const loop = () => {
    if (environment.rAF !== null) {
      let { ctx, canvas } = environment;
      ctx.globalAlpha = 0.75;
      ctx.fillStyle = "rgba(36, 38, 45, 1)";
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      ctx.fillRect(0, 0, canvas.width, canvas.height);
      ctx.globalAlpha = 1;
      environment.organisms.map((organism) => {
        let obstacle = environment.obstacles[environment.obstacles.length - 1];
        organism.update(obstacle);
        if (organism.checkCollision(obstacle)) {
          console.log("hit obstacle");
        }
        // environment.obstacles.map((obstacle) => {
        //   if (obstacle instanceof Circle) {
        //     organism.update(obstacle);
        //     if (organism.checkCollision(obstacle)) {
        //       let dist = organism.position.distanceTo(obstacle.position);
        //       if (dist < organism.r + obstacle.r) {
        //         organism.position
        //           .copy()
        //           .subtract(obstacle.position)
        //           .normalise();
        //       }
        //       console.log("hit circle");
        //     }
        //   } else if (obstacle instanceof Rectangle) {
        //     organism.update(obstacle);
        //     if (organism.checkCollision(obstacle)) {
        //       if (
        //         organism.position.x + organism.r > obstacle.position.x &&
        //         organism.position.x - organism.r <
        //           obstacle.position.x + obstacle.w &&
        //         organism.position.y + organism.r > obstacle.position.y &&
        //         organism.position.y - organism.r <
        //           obstacle.position.y + obstacle.h
        //       ) {
        //         const deltaX = Math.abs(
        //             organism.position.x - obstacle.position.x
        //           ),
        //           deltaY = Math.abs(organism.position.y - obstacle.position.y);
        //         if (deltaX > deltaY) {
        //           if (organism.position.x > obstacle.position.x) {
        //             organism.applyForce(new Vector(deltaX, 0));
        //             //   obstacle.position.x + obstacle.w;
        //           } else {
        //             organism.applyForce(new Vector(0, deltaY));
        //             // organism.position.x = obstacle.position.x - obstacle.w;
        //           }
        //         }
        //         console.log("hit rectangle");
        //       }
        //     }
        //   }
        // });
      });
      environment.obstacles.forEach((obstacle) => {
        obstacle.draw(environment.ctx);
      });
      environment.organisms.map((organism) => {
        organism.draw(environment.ctx);
      });
      environment.rAF = requestAnimationFrame(loop);
    }
  };
  const start = () => {
    init();
    loop();
  };

  return {
    setup,
    start,
  };
})();
