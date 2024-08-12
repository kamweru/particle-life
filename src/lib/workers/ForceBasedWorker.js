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
  minDistance = 0.125,
  collisionRadius = 10,
  repulsionFactor = 0.0625,
      g= 0.125,
    sigma= 0.5,
    frictionFactor= 0.1,
    dragFactor= 0.1,
  aggregate, logCounter = 0, logInterval = 2000;
const draw = (x, y, r, c) => {
  ctx.fillStyle = c;
  // "hsl("+ c +", 100%, 50% )";
  ctx.beginPath();
  ctx.arc(x, y, r, 0, Math.PI * 2);
  ctx.fill();
};
function gaussianKernel(distance, sigma) {
  return Math.exp(-(distance * distance) / (2 * sigma * sigma));
};
const logarithmicForceCurve = (distance, thresholdDistance) => {
  // return Math.log(thresholdDistance / distance) * forceFactor;
    const effectiveDistance = Math.max(distance, minDistance);
  return Math.log(thresholdDistance / effectiveDistance) * forceFactor;
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
       if (distance < collisionRadius) {
      // Calculate repulsive force
      let repulsiveForce = (collisionRadius - distance) * repulsionFactor;
      // Apply repulsive force
      a.vx -= dx * repulsiveForce;
      a.vy -= dy * repulsiveForce;
      
    // Update particle position
    updatePosition(a);
    } else if (distance < thresholdDistance) {
        // Calculate attraction force based on distance
        // let force = (thresholdDistance - distance) * forceFactor; // Adjust factor for desired attraction strength
   let force = logarithmicForceCurve(distance, thresholdDistance);
  //  console.log(force, distance);
        // Apply force in direction towards each other
        a.vx += dx * force;
        //  * timeFactor;
        a.vy += dy * force;
        //  * timeFactor;
        
    // Update particle position
    updatePosition(a);
      }
    });
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
const fs = {
  writeFile(filePath, data) {
    // This line polyfills the fs writeFile function for web workers
    // It will not work in a browser environment
    postMessage({ message: "fsWriteFile", filePath, data });
  },
};

function logData(data) {
  const jsonData = JSON.stringify(data, null, 2);
  const filename = "force-worker-"+Date.now()+".json";
  try {
    fs.writeFile(filename, jsonData);
    console.log("Data logged to file: " + filename + ".");
  } catch (error) {
    console.error("Error logging data:", error);
  }
}
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
              let F = (g * gaussianKernel(d, sigma)) / d;
        let friction = -frictionFactor * vx;
let drag = -dragFactor * vx * Math.abs(vx);
     // Log the data
 logCounter++;
  if (logCounter % logInterval === 0) {
    // console.log([fxAcc + F * dx + friction, fyAcc + F * dy + drag]);
      //  return [fxAcc + F * dx + friction, fyAcc + F * dy + drag];
  }
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
  // console.log(a);
    updatePosition(a);
  });
};
const loop = () => {
  // console.log(colorRuleMap, particles, particleMap);
  colorRuleMap.map(({color1, color2, hex1, hex2, direction}) => {
    // console.log(rule);
    rule(particleMap[color1], particleMap[color2], direction);
    if (aggregate) aggregationForce(particleMap[color1], particleMap[color2]);
  });
  ctx.clearRect(0, 0, canvasWidth, canvasHeight);
  ctx.fillStyle = "#24262d";
  ctx.fillRect(0, 0, canvasWidth, canvasHeight);
  particles.map((particle) =>{
    draw(particle.x, particle.y, particle.r, particle.c);
    // console.log(particle);
    }
  );
  const bitmap = offscreen.transferToImageBitmap();
  postMessage(bitmap);
  requestAnimationFrame(loop);
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
      minDistance,
collisionRadius,
repulsionFactor,
    g, 
    sigma, 
    frictionFactor, 
    dragFactor, 
    } = data);
    ctx = offscreen.getContext("2d");
    // console.log("loaded", data);
   loop();
  } else if (data.message === "timeFactor") {
    timeFactor = data.timeFactor;
    // console.log(timeFactor);
  } else if (data.message === "start") {
    // loop();
  } else if (data.message === "addColor") {
    // console.log("addColor");
    particles.push(...data.particles);
    particleMap = {
      ...particleMap,
      ...data.particleMap,
    };
 colorRuleMap = [...colorRuleMap, ...data.colorRuleMap];
    //  console.log(colorRuleMap, particles, particleMap);
  } else if (data.message === "adjustDirection") {
    colorRuleMap[data.index].direction = data.direction;
    // console.log(data);
  } else if (data.message === "randomize") {
    colorRuleMap = data.colorRuleMap;
    console.log("randomize");
  } else if (data.message === "thresholdDistance") {
    thresholdDistance = data.thresholdDistance;
  } else if (data.message === "forceFactor") {
    forceFactor = data.forceFactor;
  } else if (data.message === "aggregate") {
    aggregate = data.aggregate;
   } else if (data.message === "collisionRadius") {
    collisionRadius = data.collisionRadius;
  }else if (data.message === "repulsionFactor") {
    repulsionFactor = data.repulsionFactor;
  }else if (data.message === "minDistance") {
    minDistance = data.minDistance;
  }else if (data.message === "g") {
    g = data.g;
    console.log(g);
  }else if (data.message === "sigma") {
    sigma = data.sigma;
  }else if (data.message === "frictionFactor") {
    frictionFactor = data.frictionFactor;
  }else if (data.message === "dragFactor") {
    dragFactor = data.dragFactor;
  }
};
addEventListener("message", handleMessage);`,
  ]);

  return URL.createObjectURL(blob);
};

export const ForceBasedWorker = new Worker(createWorkerScript());
