import { Ellipse, Circle, Rectangle } from "../../helpers/ShapeClass";
import { Population } from "../neuralEvolution/Population";
import { getRandomFromRange, getRandomFloat, range } from "../../utils";
export const Environment = (() => {
  const environment = {
    obstacles: [],
    organisms: [],
    populationSize: 10,
    population: [],
    inputNodes: 2,
    hiddenNodes: 4,
    outputNodes: 2,
    generations: 0,
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
    let { populationSize, inputNodes, hiddenNodes, outputNodes } = environment;
    environment.population = new Population(
      populationSize,
      inputNodes,
      hiddenNodes,
      outputNodes
    );
    // environment.population.push(...population);
    environment.obstaclesArr.map((o) => {
      let { x, y, r, w, h, c, type } = o;
      if (type === "circle") {
        environment.obstacles.push(new Circle(x, y, r, c));
      }
      if (type === "rectangle") {
        environment.obstacles.push(new Rectangle(x, y, w, h, c));
      }
    });
    environment.population.genomes.map((genome) => {
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
  const calculateFitness = (organism, lastTarget, obstacles, canvas) => {
    let fitness = organism.checkCollision(lastTarget);
    // let fitness = 1 / (organism.position.distanceTo(lastTarget.position) + 1);
    // organism.fitness += fitness;
    // if (
    //   organism.position.x < canvas.x ||
    //   organism.position.x > canvas.width ||
    //   organism.position.y < canvas.y ||
    //   organism.position.y > canvas.height
    // ) {
    //   fitness -= 0.5;
    // }
    obstacles.forEach((obstacle, index) => {
      if (index !== obstacles.length - 1 && organism.checkCollision(obstacle)) {
        // fitness -= 0.2;
      }
    });
    fitness = Math.max(0, fitness / organism.hits);
    return 1 - fitness;
    // console.log(organism.fitness);
  };
  const evolvePopulation = () => {
    environment.population.genomes.sort((a, b) => b.fitness - a.fitness);
    environment.organisms.sort((a, b) => b.genome.fitness - a.genome.fitness);
    let newGenomes = environment.population.genomes.slice(
        0,
        environment.populationSize / 2
      ),
      myRange = range(
        Math.floor(environment.populationSize / 2),
        environment.populationSize - 1
      );
    for (let i = 0; i < newGenomes.length; i++) {
      let parent1 = newGenomes[i],
        parent2 = newGenomes[Math.floor(Math.random() * newGenomes.length)];
      let child = environment.population.crossover(parent1, parent2);
      child.mutate(getRandomFloat());
      newGenomes[i] = child;
    }
    for (let i = 0; i < myRange.length; i++) {
      environment.population.genomes[myRange[i]] = newGenomes[i];
      environment.organisms[myRange[i]] = new Ellipse(
        getRandomFromRange(80, 150),
        getRandomFromRange(50, 550),
        5,
        "deeppink",
        newGenomes[i]
      );
    }
    // console.log(environment.generations);
    environment.generations++;
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
        // environment.obstacles.map((obstacle, index) => {
        organism.genome.mutate(getRandomFloat());
        organism.update(obstacle);
        //   organism.checkCollision(obstacle)
        organism.genome.fitness = calculateFitness(
          organism,
          obstacle,
          environment.obstacles,
          {
            x: 50,
            y: 50,
            width: 1600,
            height: 550,
          }
        );
        // if (organism.checkCollision(obstacle)) {
        //   console.log("hit", environment.generations);
        // }
        // });

        // console.log(organism.genome.fitness);
      });
      environment.obstacles.forEach((obstacle) => {
        obstacle.draw(environment.ctx);
      });
      environment.organisms.map((organism) => {
        organism.draw(environment.ctx);
      });
      //   environment.population.evolve();
      evolvePopulation();

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
