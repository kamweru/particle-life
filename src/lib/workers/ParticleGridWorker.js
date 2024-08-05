class Particle {
  constructor(x, y, color) {
    this.x = x;
    this.y = y;
    this.c = color;
    this.vx = this.getRandomFloat();
    this.vy = this.getRandomFloat();
    this.r = 2.5;
    this.ax = 0;
    this.ay = 0;
  }

  getRandomFromRange = (min, max) =>
    Math.floor(Math.random() * (max - min + 1) + min);
  getRandomFloat = () => {
    return parseFloat((Math.random() * 2 - 1).toFixed(3));
  };
  update = (payload) => {
    let { damping, maxSpeed } = payload,
      ax = this.ax,
      ay = this.ay;
    this.vx += ax;
    this.vy += ay;
    this.vx *= damping;
    this.vy *= damping;
    let speed = Math.sqrt(this.vx * this.vx + this.vy * this.vy);
    if (speed > maxSpeed) {
      let ratio = maxSpeed / speed;
      this.vx *= ratio;
      this.vy *= ratio;
    }

    this.x += this.vx;
    this.y += this.vy;

    this.ay = 0;
    this.ax = 0;
  };
  applyForces = (payload) => {
    let { grid, gridSize, interactionRangeSquared, forces } = payload,
      cellX = Math.floor(this.x / gridSize),
      cellY = Math.floor(this.y / gridSize);
    for (let i = -1; i <= 1; i++) {
      for (let j = -1; j <= 1; j++) {
        let neighborX = cellX + i,
          neighborY = cellY + j,
          cellKey = `${neighborX},${neighborY}`;
        if (grid[cellKey]) {
          for (let p of grid[cellKey]) {
            if (p !== this) {
              let dx = p.x - this.x,
                dy = p.y - this.y,
                distSq = dx * dx + dy * dy;
              if (distSq < interactionRangeSquared) {
                let dist = Math.sqrt(distSq),
                  force = forces[this.c][p.c],
                  fx = (dx / dist) * force,
                  fy = (dy / dist) * force;
                this.ax += fx;
                this.ay += fy;
              }
            }
          }
        }
      }
    }
  };
  handleCollisions = (payload) => {
    let { grid, gridSize, collisionDistance } = payload,
      cellX = Math.floor(this.x / gridSize),
      cellY = Math.floor(this.y / gridSize);

    for (let i = -1; i <= 1; i++) {
      for (let j = -1; j <= 1; j++) {
        const neighborX = cellX + i;
        const neighborY = cellY + j;
        const cellKey = `${neighborX},${neighborY}`;
        if (grid[cellKey]) {
          for (let p of grid[cellKey]) {
            if (p !== this) {
              const dx = p.x - this.x;
              const dy = p.y - this.y;
              const distanceSquared = dx * dx + dy * dy;
              if (distanceSquared < collisionDistance * collisionDistance) {
                const distance = Math.sqrt(distanceSquared);
                const overlap = (collisionDistance - distance) / 18;
                const angle = Math.atan2(dy, dx);
                const sin = Math.sin(angle);
                const cos = Math.cos(angle);

                this.x -= overlap * cos;
                this.y -= overlap * sin;
                p.x += overlap * cos;
                p.y += overlap * sin;

                const vxRel = this.vx - p.vx;
                const vyRel = this.vy - p.vy;
                const dotProduct = vxRel * dx + vyRel * dy;
                if (dotProduct > 0) {
                  const collisionScale = dotProduct / distanceSquared;

                  const collisionVectorX = collisionScale * dx;

                  const collisionVectorY = collisionScale * dy;

                  this.vx -= collisionVectorX;

                  this.vy -= collisionVectorY;

                  p.vx += collisionVectorX;

                  p.vy += collisionVectorY;
                }
              }
            }
          }
        }
      }
    }
  };
  wrapAround = (canvas) => {
    let canvasWidth = canvas.width,
      canvasHeight = canvas.height;
    if (this.x < 0) this.x += canvasWidth;
    if (this.x > canvasWidth) this.x -= canvasWidth;
    if (this.y < 0) this.y += canvasHeight;
    if (this.y > canvasHeight) this.y -= canvasHeight;
  };
  bounceOff = (canvas) => {
    let canvasWidth = canvas.width,
      canvasHeight = canvas.height;
    if (this.x < 0) {
      this.x = -this.x;
      this.vx *= -1;
    }
    if (this.x >= canvasWidth) {
      this.x = 2 * canvasWidth - this.x;
      this.vx *= -1;
    }
    if (this.y < 0) {
      this.y = -this.y;
      this.vy *= -1;
    }
    if (this.y >= canvasHeight) {
      this.y = 2 * canvasHeight - this.y;
      this.vy *= -1;
    }
  };
  draw = (ctx) => {
    ctx.beginPath();
    ctx.arc(this.x, this.y, this.r, 0, Math.PI * 2);
    ctx.fillStyle = this.c;
    ctx.fill();
    ctx.closePath();
  };
}

class WorkerClass {
  constructor() {
    this.config = {
      numParticles: 200,
      interactionRange: 50,
      maxForceRange: 7,
      gridSize: 0,
      colorCount: 10,
      damping: 0.993,
      maxSpeed: 2.5,
      particleRadius: 1.75,
      collisionDistance: 12,
      interactionRangeSquared: 0,
      grid: {},
      particles: [],
      selectedColors: [],
      forces: {},
      dt: 0.1,
      vibratingFreq: 1080,
      rAF: undefined,
    };
    this.offscreen = undefined;
    this.ctx = undefined;
    self.addEventListener("message", this.onmessage);
  }
  getRandomFromRange = (min, max) =>
    Math.floor(Math.random() * (max - min + 1) + min);
  getRandomFloat = () => {
    return parseFloat((Math.random() * 2 - 1).toFixed(3));
  };
  buildGrid = () => {
    this.config.particles.forEach((p) => {
      let cellX = Math.floor(p.x / this.config.gridSize),
        cellY = Math.floor(p.y / this.config.gridSize);
      let cellKey = `${cellX},${cellY}`;
      if (!this.config.grid[cellKey]) this.config.grid[cellKey] = [];
      this.config.grid[cellKey].push(p);
    });
  };
  addParticle = (color) => {
    [...Array(this.config.numParticles).keys()].map(() => {
      let colorLabel = color.label,
        x = this.getRandomFromRange(0, this.config.offscreen.width),
        y = this.getRandomFromRange(0, this.config.offscreen.height);
      this.config.particles.push(new Particle(x, y, colorLabel));
    });
    this.buildGrid();
  };
  generateRandomForces = (color) => {
    if (Object.keys(this.config.forces).length > 0) {
      for (let key of Object.keys(this.config.forces)) {
        this.config.forces[key] = {
          ...this.config.forces[key],
          [color.label]: parseFloat(
            (
              Math.random() * this.config.maxForceRange * 2 -
              this.config.maxForceRange
            ).toFixed(2)
          ),
        };
      }
    }
    this.config.forces[color.label] = {};
    this.config.forces[color.label] = this.config.selectedColors.reduce(
      (acc, color2) => {
        acc[color2.label] = parseFloat(
          (
            Math.random() * this.config.maxForceRange * 2 -
            this.config.maxForceRange
          ).toFixed(2)
        );
        return acc;
      },
      {}
    );
  };
  randomize = (key) => {
    let obj = {};
    Object.keys(this.config.forces[key]).map((key) => {
      obj[key] = parseFloat(
        (
          Math.random() * this.config.maxForceRange * 2 -
          this.config.maxForceRange
        ).toFixed(2)
      );
    });
    this.config.forces[key] = obj;
  };
  randomizeAll = () => {
    Object.keys(this.config.forces).map((key) => {
      this.randomize(key);
    });
  };
  addColor = (color) => {
    this.config.selectedColors.push(color);
    this.addParticle(color);
    this.generateRandomForces(color);
  };
  loop = () => {
    let { offscreen, ctx } = this.config;
    ctx.globalAlpha = 0.75;
    ctx.fillStyle = "rgba(36, 38, 45, 1)";
    ctx.clearRect(0, 0, offscreen.width, offscreen.height);
    ctx.fillRect(0, 0, offscreen.width, offscreen.height);
    ctx.globalAlpha = 1;
    this.buildGrid();
    this.config.particles.forEach((particle) => {
      particle.applyForces({
        grid: this.config.grid,
        forces: this.config.forces,
        gridSize: this.config.gridSize,
        interactionRangeSquared: this.config.interactionRangeSquared,
      });
      particle.handleCollisions({
        grid: this.config.grid,
        gridSize: this.config.gridSize,
        collisionDistance: this.config.collisionDistance,
      });
      particle.update({
        damping: this.config.damping,
        maxSpeed: this.config.maxSpeed,
      });
      particle.wrapAround(offscreen);
      particle.draw(ctx);
    });
    const bitmap = this.config.offscreen.transferToImageBitmap();
    postMessage({ bitmap: bitmap, forces: this.config.forces });
    this.config.rAF = requestAnimationFrame(this.loop);
  };
  onmessage = ({ data }) => {
    let { message } = data;
    // console.log(message);
    switch (message) {
      case "setup":
        for (let key in data.config) {
          this.config[key] = data.config[key];
        }

        this.config.gridSize = this.config.interactionRange;
        this.config.interactionRangeSquared = Math.pow(
          this.config.interactionRange,
          2
        );
        // console.log(this.config);
        if (!this.config.ctx)
          this.config.ctx = this.config.offscreen.getContext("2d");
        break;
      case "addColor":
        this.addColor(data.color);
        // console.log("Added color: ", data.color, this.config.selectedColors);
        break;
      case "randomize":
        this.randomize(data.key);
        break;
      case "randomizeAll":
        this.randomizeAll();
        break;
      case "start":
        // this.generateRandomForces();
        this.loop();
        break;
    }
  };
}

// new ()();

let dataObj = Particle + " new (" + WorkerClass + ")();"; // here is the trick to convert the above fucntion to string
let blob = new Blob([dataObj.replace('"use strict";', "")], {
  type: "application/javascript",
}); // firefox adds "use strict"; to any function which might block worker execution so knock it off

let blobURL = URL.createObjectURL(blob);

export const ParticleGridWorker = new Worker(blobURL); // spawn new worker
