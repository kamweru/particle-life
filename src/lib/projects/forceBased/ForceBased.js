import { getRandomFloat, getRandomFromRange } from "../../utils";

const particle = (x, y, r, c) => ({
  x: x,
  y: y,
  r: r,
  vx: 0,
  vy: 0,
  c: c,
});

export const ForceBased = (() => {
  const config = {
    timeFactor: -0.078125,
    thresholdDistance: 10,
    aggregate: false,
    forceFactor: 0.078125,
    collisionRadius: 10,
    minDistance: getRandomFloat(),
    repulsionFactor: getRandomFloat(),
    g: 0.125,
    sigma: 0.5,
    frictionFactor: 0.1,
    dragFactor: 0.1,
    minParticles: 180,
    maxParticles: 220,
    particles: [],
    particleMap: {},
    colorRuleMap: [],
    selectedColors: [],
  };
  const createParticles = (number, color) => {
    let { canvas } = config;
    let group = Array.from({ length: number }, (v, i) => i).map((item) => {
      let r = getRandomFromRange(2, 3);
      let x = getRandomFromRange(0, canvas.width - r);
      let y = getRandomFromRange(0, canvas.height - r);
      return particle(x, y, r, color);
    });
    config.particles = [...config.particles, ...group];
    return group;
  };
  const addToParticleMap = (label, particles) => {
    let particleMap = {};
    particleMap[label] = particles;
    config.particleMap = { ...config.particleMap, ...particleMap };
    return particleMap;
  };
  const createParticleMap = () => {
    let { selectedColors } = config;
    selectedColors.map((color) =>
      addToParticleMap(
        color.label,
        createParticles(
          getRandomFromRange(config.minParticles, config.maxParticles),
          color.value
        )
      )
    );
  };
  const createColorRuleMap = () => {
    let { selectedColors } = config;
    selectedColors.flatMap((color1) => {
      selectedColors.map((color2) => {
        config.colorRuleMap.push({
          color1: color1.label,
          color2: color2.label,
          hex1: color1.value,
          hex2: color2.value,
          direction: getRandomFloat(),
        });
      });
    });
  };
  const addSelectedColor = (color) => config.selectedColors.push(color);
  const addColor = (color) => {
    let colorParticles = createParticles(
      getRandomFromRange(config.minParticles, config.maxParticles),
      color.value
    );
    return colorParticles;
  };
  const setup = (payload) => {
    for (let key in payload) {
      config[key] = payload[key];
    }
  };
  const getSelectedColors = () => config.selectedColors;
  const addToColorRuleMap = (color) => {
    let colorRuleMap = [];
    colorRuleMap.push({
      color1: color.label,
      color2: color.label,
      hex1: color.value,
      hex2: color.value,
      direction: Math.random() < 0.5 ? -0.078125 : 0.078125,
    });
    config.selectedColors.map(({ label, value }) => {
      if (label !== color.label) {
        colorRuleMap.push({
          color1: color.label,
          color2: label,
          hex1: color.value,
          hex2: value,
          direction: Math.random() < 0.5 ? -0.078125 : 0.078125,
        });
        colorRuleMap.push({
          color1: label,
          color2: color.label,
          hex1: value,
          hex2: color.value,
          direction: Math.random() < 0.5 ? -0.078125 : 0.078125,
        });
      }
    });
    config.colorRuleMap = [...config.colorRuleMap, ...colorRuleMap];
    return colorRuleMap;
  };
  const randomizeDirection = (color) => {
    if (color === "all") {
      config.colorRuleMap = config.colorRuleMap.map((rule) => ({
        ...rule,
        direction: getRandomFloat(),
      }));
    } else {
      config.colorRuleMap = config.colorRuleMap.map((rule) =>
        rule.color1 === color ? { ...rule, direction: getRandomFloat() } : rule
      );
    }
    return config.colorRuleMap;
  };
  const getData = () => {
    let { canvas } = config,
      keyArr = [
        "particles",
        "particleMap",
        "colorRuleMap",
        "timeFactor",
        "thresholdDistance",
        "aggregate",
        "forceFactor",
        "collisionRadius",
        "minDistance",
        "repulsionFactor",
        "g",
        "sigma",
        "frictionFactor",
        "dragFactor",
      ],
      data = {
        canvasWidth: canvas.width,
        canvasHeight: canvas.height,
      };
    for (let key of keyArr) {
      data[key] = config[key];
    }
    return data;
  };
  const drawBitmap = (bitmap) => {
    let { ctx } = config;
    ctx.drawImage(bitmap, 0, 0);
  };
  return {
    createParticles,
    createParticleMap,
    createColorRuleMap,
    addSelectedColor,
    addToParticleMap,
    addToColorRuleMap,
    getSelectedColors,
    randomizeDirection,
    addColor,
    getData,
    drawBitmap,
    setup,
  };
})();
