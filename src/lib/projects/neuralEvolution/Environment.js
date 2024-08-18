// import { Genome } from "./Genome";
// import { NeuralNetwork } from "./NeuralNetwork";
import { Vector } from "./Vector";
import { Population } from "./Population";
import { Agent } from "./Agent";
import { getRandomFloat, getRandomFromRange } from "../../utils";

export const Environment = (() => {
  const environment = {
    populationSize: 10,
    inputNodes: 2,
    hiddenNodes: 4,
    outputNodes: 2,
    target: { r: 10 },
    bestAgent: null,
    agents: [],
  };

  const init = () => {
    let { populationSize, inputNodes, hiddenNodes, outputNodes, canvas } =
      environment;
    environment.population = new Population(
      populationSize,
      inputNodes,
      hiddenNodes,
      outputNodes
    );
    environment.target.position = new Vector(
      getRandomFromRange(0, canvas.width),
      getRandomFromRange(0, canvas.height)
    );
  };

  const evaluateFitness = (agent, target) => {
    const dx = agent.position.x - target.position.x;
    const dy = agent.position.y - target.position.y;
    return 1 / (dx * dx + dy * dy + 1); // Fitness is higher the closer the agent is to the target
  };
  // Collision detection function
  function checkCollision(agent, target) {
    const distance = agent.position.dist(target.position);
    return distance < agent.r + target.r;
  }

  // Action to perform when an agent hits the target
  function onAgentHitTarget(agent, target) {
    console.log("Agent hit the target!");
    target.position = getRandomPosition();
  }
  const evaluatePopulation = () => {
    let maxFitness = -Infinity;
    for (let agent of environment.agents) {
      if (agent.genome.fitness > maxFitness) {
        maxFitness = agent.genome.fitness;
        agent.opacity = 0.125;
        environment.bestAgent = agent;
      }
    }
  };

  // Function to get a random position within the canvas
  function getRandomPosition() {
    let { canvas } = environment;
    return new Vector(
      Math.random() * canvas.width,
      Math.random() * canvas.height
    );
  }

  const simulate = () => {
    let { ctx, canvas, population, target } = environment;
    ctx.globalAlpha = 0.75;
    ctx.fillStyle = "rgba(36, 38, 45, 1)";
    ctx.clearRect(0, 0, ctx.canvas.width, ctx.canvas.height);
    ctx.fillRect(0, 0, ctx.canvas.width, ctx.canvas.height);
    ctx.globalAlpha = 1;
    population.genomes.forEach((genome) => {
      let agent = new Agent(
        getRandomFromRange(0, canvas.width),
        getRandomFromRange(0, canvas.height),
        genome
      );
      genome.mutate(0.1);
      environment.agents.push(agent);
      for (let i = 0; i < 100; i++) {
        // Let each agent take 100 steps
        agent.update(target);
      }
      let fitness = evaluateFitness(agent, target);
      genome.fitness = fitness;
      evaluatePopulation();
      if (environment.bestAgent) {
        environment.bestAgent.opacity = 1;
        environment.bestAgent.c = 49;
      }
      if (checkCollision(agent, target)) {
        onAgentHitTarget(agent, target);
      }
      // agent.wander();
      agent.draw(ctx);
    });

    population.evolve();

    // Draw target
    ctx.beginPath();
    ctx.arc(target.position.x, target.position.y, target.r, 0, Math.PI * 2);
    ctx.fillStyle = "hsla(326, 100%, 50%, 1)";
    ctx.fill();
    ctx.closePath();

    // setTimeout(() => {
    //   requestAnimationFrame(simulate);
    // }, 100); // 100ms delay
    requestAnimationFrame(simulate);
  };

  const start = () => {
    init();
    simulate();
  };
  const setup = (payload) => {
    for (let key in payload) {
      environment[key] = payload[key];
    }
  };

  return {
    setup,
    start,
  };
})();
