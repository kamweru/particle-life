const createWorkerScript = () => {
  const blob = new Blob([
    `let ctx,
  offscreen,
  particleMap={},
  particles=[],
  colorRuleMap=[],
  timeFactor,
  canvasWidth,
  canvasHeight,
  thresholdDistance,
  forceFactor,
  aggregate;
const draw = (x, y, r, c) => {
  ctx.fillStyle = c;
  ctx.beginPath();
  ctx.arc(x, y, r, 0, Math.PI * 2);
  ctx.fill();
};
const aggregationForce = (particle1, particle2) => {
  particle1.forEach((a) => {
    let { x: ax, y: ay, vx, vy } = a;
    particle2.forEach((b) => {
      let { x: bx, y: by } = b;
      let dx = ax - bx;
      let dy = ay - by;
      let distance = Math.sqrt(dx * dx + dy * dy);

      // Check if particles are within the threshold distance
      if (distance < thresholdDistance) {
        // Calculate attraction force based on distance
        let force = (thresholdDistance - distance) * forceFactor; // Adjust factor for desired attraction strength

        // Apply force in direction towards each other
        a.vx += dx * force;
        //  * timeFactor;
        a.vy += dy * force;
        //  * timeFactor;
      }
    });
    // Update particle position
    updatePosition(a);
  });
};
const wrapAround = (particle) => {
  if (particle.x < 0) particle.x += canvasWidth;
  if (particle.x > canvasWidth) particle.x -= canvasWidth;
  if (particle.y < 0) particle.y += canvasHeight;
  if (particle.y > canvasHeight) particle.y -= canvasHeight;
};
const bounceOff = (particle) => {
  if (particle.x < 0) {
    particle.x = -particle.x;
    particle.vx *= -1;
  }
  if (particle.x >= canvasWidth) {
    particle.x = 2 * canvasWidth - particle.x;
    particle.vx *= -1;
  }
  if (particle.y < 0) {
    particle.y = -particle.y;
    particle.vy *= -1;
  }
  if (particle.y >= canvasHeight) {
    particle.y = 2 * canvasHeight - particle.y;
    particle.vy *= -1;
  }
};
const updatePosition = (particle) => {
  particle.x += particle.vx;
  particle.y += particle.vy;
  wrapAround(particle);
};
const rule = (particle1, particle2, g) => {
  particle1.forEach((a) => {
    let { x: ax, y: ay, vx, vy } = a;
    let [fx, fy] = particle2.reduce(
      ([fxAcc, fyAcc], b) => {
        let { x: bx, y: by } = b;
        let dx = ax - bx;
        let dy = ay - by;
        let d = Math.sqrt(dx * dx + dy * dy);
        let distance = Math.sqrt(
          (canvasWidth * canvasHeight) / particle1.length
        );
        if (d > 0 && d < distance) {
          let F = g * (1 / d);
          return [fxAcc + F * dx, fyAcc + F * dy];
        }
        return [fxAcc, fyAcc];
      },
      [0, 0]
    );

    a.vx = (vx + fx) * timeFactor;
    a.vy = (vy + fy) * timeFactor;
    updatePosition(a);
  });
};

const loop = () => {
  requestAnimationFrame(loop);
  console.log(colorRuleMap, particles, particleMap);
  colorRuleMap.map(({ color1, color2, hex1, hex2, direction }) => {
    rule(particleMap[color1], particleMap[color2], direction);
    if (aggregate) aggregationForce(particleMap[color1], particleMap[color2]);
  });
  ctx.clearRect(0, 0, canvasWidth, canvasHeight);
  ctx.fillStyle = "#121619";
  ctx.fillRect(0, 0, canvasWidth, canvasHeight);
  particles.map((particle) =>
    draw(particle.x, particle.y, particle.r, particle.color)
  );
  const bitmap = offscreen.transferToImageBitmap();
  postMessage(bitmap);
};

const handleMessage = ({ data }) => {
  if (data.message === "load") {
    ({
      offscreen,
      particleMap,
      particles,
      colorRuleMap,
      timeFactor,
      canvasWidth,
      canvasHeight,
      thresholdDistance,
      forceFactor,
    } = data);
    ctx = offscreen.getContext("2d");
   // loop();
  } else if (data.message === "timeFactor") {
    timeFactor = data.timeFactor;
  } else if (data.message === "start") {
    loop();
  } else if (data.message === "addColor") {
    // console.log("addColor");
    particles = [...particles, ...data.particles];
    particleMap = {
      ...particleMap,
      ...data.particleMap,
    };
    colorRuleMap = [...colorRuleMap, ...data.colorRuleMap];
     console.log(colorRuleMap, particles, particleMap);
  } else if (data.message === "adjustDirection") {
    colorRuleMap[data.index].direction = data.direction;
  } else if (data.message === "randomizeDirection") {
    colorRuleMap = data.colorRuleMap;
  } else if (data.message === "thresholdDistance") {
    thresholdDistance = data.thresholdDistance;
  } else if (data.message === "forceFactor") {
    forceFactor = data.forceFactor;
  } else if (data.message === "aggregate") {
    aggregate = data.aggregate;
  }
};
addEventListener("message", handleMessage);`,
  ]);

  return URL.createObjectURL(blob);
};

export const ForceBasedWorker = new Worker(createWorkerScript());
