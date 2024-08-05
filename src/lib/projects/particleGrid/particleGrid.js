import { getRandomFloat, getRandomFromRange, range } from "../../utils";
let colorsArr = [
  { label: "Aqua", value: "#00FFFF" },
  { label: "Aquamarine", value: "#7FFFD4" },
  { label: "BlueViolet", value: "#8A2BE2" },
  { label: "Brown", value: "#A52A2A" },
  { label: "BurlyWood", value: "#DEB887" },
  { label: "CadetBlue", value: "#5F9EA0" },
  { label: "Chartreuse", value: "#7FFF00" },
  { label: "Chocolate", value: "#D2691E" },
  { label: "CornflowerBlue", value: "#6495ED" },
  { label: "Crimson", value: "#DC143C" },
  { label: "Cyan", value: "#00FFFF" },
  { label: "DarkCyan", value: "#008B8B" },
  { label: "DeepPink", value: "#FF1493" },
  { label: "DeepSkyBlue", value: "#00BFFF" },
  { label: "ForestGreen", value: "#228B22" },
  { label: "Fuchsia", value: "#FF00FF" },
  { label: "Gold", value: "#FFD700" },
  { label: "HoneyDew", value: "#F0FFF0" },
  { label: "HotPink", value: "#FF69B4" },
  { label: "IndianRed", value: "#CD5C5C" },
  { label: "Lime", value: "#00FF00" },
  { label: "Orchid", value: "#DA70D6" },
  { label: "Red", value: "#FF0000" },
  { label: "SkyBlue", value: "#87CEEB" },
  { label: "SlateBlue", value: "#6A5ACD" },
  { label: "SlateGray", value: "#708090" },
  { label: "Teal", value: "#008080" },
  { label: "Tomato", value: "#FF6347" },
  { label: "Turquoise", value: "#40E0D0" },
  { label: "Violet", value: "#EE82EE" },
  { label: "Yellow", value: "#FFFF00" },
].sort((a, b) => a.label.localeCompare(b.label));
export class Particle {
  constructor(x, y, color) {
    this.x = x;
    this.y = y;
    this.c = color;
    this.vx = getRandomFloat();
    this.vy = getRandomFloat();
    this.r = 3;
    this.ax = 0;
    this.ay = 0;
  }
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
class Vector {
  constructor(x, y, z) {
    this.x = x;
    this.y = y;
    this.z = z;
  }
  rotate(angle) {
    // Rotate vector by angle
    let x = this.x;
    let y = this.y;
    let z = this.z;
    let c = Math.cos(angle);
    let s = Math.sin(angle);
    this.x = x * c - y * s;
    this.y = x * s + y * c;
    this.z = z;
  }
  // given the distance in units, return the force in units
  distance(dist) {
    return this.z / (dist * dist);
  }
}
export const ParticleGrid = (() => {
  const config = {
    numParticles: 2000,
    interactionRange: 50,
    maxForceRange: 7,
    gridSize: 0,
    colorCount: 10,
    damping: 0.993,
    maxSpeed: 2.5,
    particleRadius: 1.75,
    collisionDistance: 1.75 * 2.5 + 7,
    interactionRangeSquared: 0,
    grid: {},
    particles: [],
    forces: {},
    dt: 0.1,
    vibratingFreq: 1080,
  };
  const buildGrid = () => {
    config.grid = {};
    config.particles.forEach((particle) => {
      let cellX = Math.floor(particle.x / config.gridSize),
        cellY = Math.floor(particle.y / config.gridSize),
        cellKey = `${cellX},${cellY}`;
      if (!config.grid[cellKey]) config.grid[cellKey] = [];
      config.grid[cellKey].push(particle);
    });
  };
  const initParticles = () => {
    config.particles = [];
    config.gridSize = config.interactionRange;
    config.interactionRangeSquared = Math.pow(config.interactionRange, 2);
    let selectedColors = colorsArr.slice(0, config.colorCount);
    for (let i = 0; i < config.numParticles; i++) {
      let { canvas } = config,
        color =
          selectedColors[Math.floor(Math.random() * selectedColors.length)]
            .label,
        x = getRandomFromRange(0, canvas.width),
        y = getRandomFromRange(0, canvas.height);
      config.particles.push(new Particle(x, y, color));
    }
    buildGrid();
  };
  const generateRandomForces = () => {
    config.forces = {};
    let { maxForceRange } = config;
    let selectedColors = colorsArr.slice(0, config.colorCount);
    selectedColors.map((color) => {
      config.forces[color.label] = {};
      selectedColors.map((color1) => {
        config.forces[color.label][color1.label] = parseFloat(
          (Math.random() * maxForceRange * 2 - maxForceRange).toFixed(2)
        );
      });
    });
  };
  const setup = (payload) => {
    for (let key in payload) {
      config[key] = payload[key];
    }
  };
  const updateForces = (force, key, value) => {
    config.forces[key][force] = value;
  };
  const randomize = (key) => {
    let obj = {};
    Object.keys(config.forces[key]).map((key) => {
      obj[key] = parseFloat(
        (
          Math.random() * config.maxForceRange * 2 -
          config.maxForceRange
        ).toFixed(2)
      );
    });
    config.forces[key] = obj;
  };
  const randomizeAll = () => {
    Object.keys(config.forces).map((key) => {
      randomize(key);
    });
  };
  const loop = () => {
    let { canvas, ctx } = config;
    ctx.globalAlpha = 0.75;
    ctx.fillStyle = "rgba(36, 38, 45, 1)";
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    ctx.fillRect(0, 0, canvas.width, canvas.height);
    ctx.globalAlpha = 1;
    buildGrid();
    config.particles.forEach((particle) => {
      particle.applyForces({
        grid: config.grid,
        forces: config.forces,
        gridSize: config.gridSize,
        interactionRangeSquared: config.interactionRangeSquared,
      });
      particle.handleCollisions({
        grid: config.grid,
        gridSize: config.gridSize,
        collisionDistance: config.collisionDistance,
      });
      particle.update({
        damping: config.damping,
        maxSpeed: config.maxSpeed,
      });
      particle.wrapAround(canvas);
      particle.draw(ctx);
    });
    config.rAF = requestAnimationFrame(loop);
  };

  const start = () => {
    generateRandomForces();
    initParticles();
    loop();
  };
  const stop = () => {
    if (config.rAF) {
      cancelAnimationFrame(config.rAF);
      config.rAF = undefined;
    }
  };

  const getForces = () => config.forces;

  const running = () => {
    if (config.rAF) {
      return true;
    } else {
      return false;
    }
  };

  return {
    setup,
    start,
    stop,
    running,
    getForces,
    updateForces,
    randomize,
    randomizeAll,
  };
})();
