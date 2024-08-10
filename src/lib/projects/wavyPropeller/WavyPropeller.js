import { getRandomFromRange } from "../../utils";

function drawCurve(ctx, x1, x2, y) {
  // Calculate the control point for the quadratic curve
  const controlX = (x1 + x2) / 2;
  const controlY = y * 1.2; // Adjust the height of the curve

  // Begin the path
  ctx.beginPath();

  // Move to the starting point
  ctx.moveTo(x1, x1);

  // Draw the quadratic curve
  ctx.quadraticCurveTo(controlX, controlY, x2, x1);

  // Stroke the path
  ctx.stroke();
}
export const WavyPropeller = (() => {
  const config = {
    speed: 0.0018,
    cycleCount: 0,
  };

  const rect = {
      x: 400,
      y: 20,
      w: 200,
      h: 100,
      vx: 0,
      vy: 0,
    },
    tail = {
      x: rect.x + rect.w,
      y: (rect.y + rect.h) / 2,
      w: (rect.y + rect.h) / 2 + rect.w,
    },
    roundRect = {
      x: 350,
      y: 350,
      w: 100,
      h: 100,
      vx: 0,
      vy: 0,
    };

  const setup = (params) => {
    for (let key in params) {
      config[key] = params[key];
    }
    config.points = {
      current: generateTailPoints(tail),
      next: generateTailPoints(tail),
    };
  };
  function calculateNewPoint(x, y, angle, distance) {
    // Convert angle to radians
    const angleRadians = (angle * Math.PI) / 180;

    // Calculate new x and y coordinates
    const newX = x + distance * Math.cos(angleRadians);
    const newY = y + distance * Math.sin(angleRadians);

    return { x: newX, y: newY };
  }
  const drawPropeller = () => {
    const points = config.points.current,
      ctx = config.ctx;
    // Draw the tail (line connecting the center to the tail position)
    ctx.beginPath();
    ctx.moveTo(rect.x + rect.w, rect.y + rect.h / 2);
    ctx.lineTo(tail.x, tail.y);
    ctx.stroke();

    // Draw the propeller points
    ctx.fillStyle = "red"; // Set your desired color
    for (const [x, y] of points) {
      ctx.beginPath();
      ctx.arc(x, y, 1, 0, 2 * Math.PI);
      ctx.fill();
    }
  };

  const calculateVelocity = () => {
    const points = config.points.current;
    if (points.length < 2) return;

    const lastPoint = points[points.length - 1];
    const secondLastPoint = points[points.length - 2];

    const dx = lastPoint[0] - secondLastPoint[0];
    const dy = lastPoint[1] - secondLastPoint[1];

    const angle = Math.atan2(dy, dx);
    const speed = Math.sqrt(dx * dx + dy * dy);

    rect.vx = Math.cos(angle) * speed * config.speed * 100;
    rect.vy = Math.sin(angle) * speed * config.speed * 100;
    // console.log(rect);
  };

  const updateRectPosition = () => {
    rect.x += rect.vx;
    rect.y += rect.vy;

    // Update tail position
    tail.x = rect.x + rect.w;
    tail.y = (rect.y + rect.h) / 2;
  };
  function calculateAverageVelocity(points) {
    let totalVx = 0;
    let totalVy = 0;

    for (let i = 0; i < points.length - 1; i++) {
      const dx = points[i + 1].x - points[i].x;
      const dy = points[i + 1].y - points[i].y;
      totalVx += dx;
      totalVy += dy;
    }

    const numPoints = points.length - 1;
    const averageVx = totalVx / numPoints;
    const averageVy = totalVy / numPoints;

    return { vx: averageVx * 1.1, vy: averageVy * 1.1 };
  }
  let count = 0,
    someThreshold = 2,
    points = [],
    angleDistances = [...Array(100).keys()].map((i) => ({
      angle: getRandomFromRange(-25, 25),
      distance: getRandomFromRange(roundRect.w / 2, roundRect.w),
    }));
  //   console.log(angleDistances);
  const draw = (t) => {
    let { ctx, canvas, speed } = config;
    if (speed * t > config.cycleCount + 1) {
      config.cycleCount++;
      config.points.current = config.points.next;
      config.points.next = generateTailPoints(tail);
    }
    // console.log(config.points);

    calculateVelocity();
    updateRectPosition();

    ctx.globalAlpha = 0.75;
    ctx.fillStyle = "#24262d";
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    ctx.fillRect(0, 0, canvas.width, canvas.height);
    ctx.globalAlpha = 1;
    count % 2 == 0 ? (ctx.strokeStyle = "green") : (ctx.strokeStyle = "red");
    ctx.beginPath();
    ctx.roundRect(rect.x, rect.y, rect.w, rect.h, [10, 20, 25, 36]);
    ctx.stroke();
    // Draw the tail
    drawPropeller();
    drawCurve(ctx, 150, 200, 50);
    drawCurve(ctx, 200, 250, 50);

    ctx.fillStyle = "hsla(120, 100%, 50%, 0.375)";
    ctx.beginPath();
    ctx.ellipse(200, 200, 10, 25, 0, 0, 2 * Math.PI);
    ctx.fill();
    ctx.beginPath();
    ctx.ellipse(190, 225, 10, 25, -12, 0, 2 * Math.PI);
    ctx.fill();
    ctx.beginPath();
    ctx.ellipse(210, 225, 10, 25, 12, 0, 2 * Math.PI);
    ctx.fill();

    // Example usage:
    const startX = 100;
    const startY = 400;
    const angle = angleDistances[count].angle;
    //   count % 2 == 0
    //     ? getRandomFromRange(-25, 25)
    //     : getRandomFromRange(-25, 25); // degrees
    const distance = angleDistances[count].distance;
    //   count % 2 == 0
    //     ? getRandomFromRange(50, 100)
    //     : getRandomFromRange(50, 100); // adjust distance as needed
    const newPoint = calculateNewPoint(
      roundRect.w,
      roundRect.y + roundRect.h / 2,
      angle,
      distance
    );
    points.push(newPoint);
    ctx.beginPath();
    ctx.roundRect(
      roundRect.x,
      roundRect.y,
      roundRect.w,
      roundRect.h,
      [10, 10, 15, 15]
    );
    ctx.moveTo(roundRect.x, roundRect.y + roundRect.h / 2);
    // count % 3 == 0 ? ctx.lineTo(100, 400) : ctx.lineTo(200, 400);
    ctx.lineTo(newPoint.x + roundRect.w, newPoint.y);
    // ctx.lineTo(200, 400);
    ctx.stroke();
    // if (count !== angleDistances.length) {
    if (points.length > someThreshold) {
      const averageVelocity = calculateAverageVelocity(points);
      roundRect.vx = averageVelocity.vx;
      roundRect.vy = averageVelocity.vy;
      roundRect.x += roundRect.vx;
      roundRect.y += roundRect.vy;
      //   console.log(averageVelocity, roundRect); // Output: { vx: ..., vy: ... }
      points = []; // Reset points array
    }
    angleDistances.push({
      angle: getRandomFromRange(-25, 25),
      distance: getRandomFromRange(roundRect.w / 2, roundRect.w),
    });
    // }
    count++;
    requestAnimationFrame(draw);
  };

  const generateTailPoints = (tail) => {
    let p = [],
      resolution = 1;
    const freq = (0.05 + Math.random() * 0.05) / resolution;
    const amplitude = (0.1 + Math.random() * 0.45) * rect.h * 0.9;
    for (let i = 0; i < tail.w; i++) {
      p.push([i + tail.x, Math.floor(amplitude * Math.sin(i * freq) + tail.y)]);
    }
    return p;
  };

  return { setup, draw };
})();
