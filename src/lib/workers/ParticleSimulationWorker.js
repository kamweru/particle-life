const WorkerFunction = () => {
  const config = { rAF: null };

  const setup = (payload) => {
    for (let key in payload) {
      config[key] = payload[key];
    }
  };
  const makeRandomMatrix = () => {
    const rows = [];
    for (let i = 0; i < config.m; i++) {
      const row = [];
      for (let j = 0; j < config.m; j++) {
        row.push(Math.random() * 2 - 1);
      }
      rows.push(row);
    }
    return rows;
  };

  const force = (r, a) => {
    const beta = 0.3;
    if (r < beta) {
      return r / beta - 1;
    } else if (beta < r && r < 1) {
      return a * (1 - Math.abs(2 * r - 1 - beta) / (1 - beta));
    } else {
      return 0;
    }
  };
  const init = () => {
    let { canvas } = config;
    config.matrix = makeRandomMatrix();

    config.frictionFactor = Math.pow(0.5, config.dt / config.frictionHalfLife);
    config.partitions = Array.from(
      { length: Math.ceil(canvas.width / config.partitionSize) },
      () =>
        Array.from(
          { length: Math.ceil(canvas.height / config.partitionSize) },
          () => []
        )
    );
    config.colors = new Int32Array(config.numParticles);
    config.positionsX = new Float32Array(config.numParticles);
    config.positionsY = new Float32Array(config.numParticles);
    config.velocitiesX = new Float32Array(config.numParticles);
    config.velocitiesY = new Float32Array(config.numParticles);
    // start();
  };
  const updateParticles = () => {
    for (const row of config.partitions) {
      for (const partition of row) {
        partition.length = 0;
      }
    }
    // Update partition size based on local density
    config.partitionSize = calculateAdaptivePartitionSize();

    // Reassign particles to partitions
    for (let i = 0; i < config.n; i++) {
      const partitionX = Math.floor(
        (config.positionsX[i] * config.canvas.width) / config.partitionSize
      );
      const partitionY = Math.floor(
        (config.positionsY[i] * config.canvas.height) / config.partitionSize
      );
      config.partitions[partitionX][partitionY].push(i);
    }
    // for (let i = 0; i < config.numParticles; i++) {
    //   const partitionX = Math.floor(
    //     (config.positionsX[i] * config.canvas.width) / config.partitionSize
    //   );
    //   const partitionY = Math.floor(
    //     (config.positionsY[i] * config.canvas.height) / config.partitionSize
    //   );
    //   config.partitions[partitionX][partitionY].push(i);
    // }
    for (let i = 0; i < config.numParticles; i++) {
      let totalForceX = 0,
        totalForceY = 0;

      for (let j = 0; j < config.numParticles; j++) {
        if (j === i) continue;
        const rx = config.positionsX[j] - config.positionsX[i],
          ry = config.positionsY[j] - config.positionsY[i],
          r = Math.hypot(rx, ry);
        if (r > 0 && r < config.rMax) {
          const f = force(
            r / config.rMax,
            config.matrix[config.colors[i]][config.colors[j]]
          );
          totalForceX += (rx / r) * f;
          totalForceY += (ry / r) * f;
        }
      }
      totalForceX *= config.rMax * config.forceFactor;
      totalForceY *= config.rMax * config.forceFactor;

      config.velocitiesX[i] *= config.frictionFactor;
      config.velocitiesY[i] *= config.frictionFactor;

      config.velocitiesX[i] += totalForceX * config.dt;
      config.velocitiesY[i] += totalForceY * config.dt;
    }
    for (let i = 0; i < config.numParticles; i++) {
      config.positionsX[i] += config.velocitiesX[i] * config.dt;
      config.positionsY[i] += config.velocitiesY[i] * config.dt;
    }
  };
  const calculateAdaptivePartitionSize = () => {
    // Implement logic to calculate partition size based on local density
    // For simplicity, return a fixed value here
    // return getRandomFromRange(50, 100);
    const totalParticles = config.n;
    const totalArea = config.canvas.width * config.canvas.height;
    return totalParticles / totalArea;
  };
  const adjustParticlePositions = () => {
    // Adjust particle positions for continuous movement...
    for (let i = 0; i < config.numParticles; i++) {
      if (config.positionsX[i] < 0) {
        config.positionsX[i] = 1;
      } else if (config.positionsX[i] > 1) {
        config.positionsX[i] = 0;
      }
      if (config.positionsY[i] < 0) {
        config.positionsY[i] = 1;
      } else if (config.positionsY[i] > 1) {
        config.positionsY[i] = 0;
      }
    }
  };
  const draw = () => {
    let { canvas, ctx } = config;
    ctx.globalAlpha = 0.75;
    ctx.fillStyle = "rgba(36, 38, 45, 1)";
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    ctx.fillRect(0, 0, canvas.width, canvas.height);
    ctx.globalAlpha = 1;

    for (let i = 0; i < config.numParticles; i++) {
      // if (i === 0) console.log((360 * config.colors[i]) / config.m);
      ctx.fillStyle = `hsl(${(360 * config.colors[i]) / config.m}, 100%, 50%)`;
      const screenX = config.positionsX[i] * canvas.width;
      const screenY = config.positionsY[i] * canvas.height;
      ctx.beginPath();
      ctx.arc(screenX, screenY, 3, 0, 2 * Math.PI);
      ctx.fill();
    }
    const bitmap = config.canvas.transferToImageBitmap();
    postMessage({ bitmap });
  };

  const getRandomFromRange = (min, max) => {
    return Math.random() * (max - min) + min;
  };

  const loop = () => {
    updateParticles();
    adjustParticlePositions();
    draw();
    config.rAF = requestAnimationFrame(loop);
  };
  const start = () => {
    init();
    for (let i = 0; i < config.numParticles; i++) {
      config.colors[i] = Math.floor(Math.random() * config.m);
      config.positionsX[i] = Math.random();
      config.positionsY[i] = Math.random();
      config.velocitiesX[i] = 0;
      config.velocitiesY[i] = 0;
    }
    loop();
  };
  const stop = () => cancelAnimationFrame(config.rAF);
  onmessage = ({ data }) => {
    let { message } = data;
    switch (message) {
      case "init":
        config.canvas = data.offscreen;
        config.ctx = config.canvas.getContext("2d");
        break;
      case "configSetup":
        setup(data.config);
        break;
      case "start":
        start();
        // console.log("start");
        break;
      case "updateConfig":
        setup(data.config);

        config.frictionFactor = Math.pow(
          0.5,
          config.dt / config.frictionHalfLife
        );
        // console.log("updateConfig");
        break;
    }
  };
};

let dataObj = `(${WorkerFunction})();`;
let blob = new Blob([dataObj.replace('"use strict";', "")], {
  type: "application/javascript",
});
let blobURL = URL.createObjectURL(blob);
export const ParticleSimulationWorker = new Worker(blobURL);
