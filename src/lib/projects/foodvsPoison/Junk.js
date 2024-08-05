let rAF,
  { ctx, canvas } = $store.canvas,
  rect = {
    x: 750,
    y: 750,
    w: 50,
    h: 50,
    vx: 0,
    vy: 0,
    size: 50,
    direction: -1,
    angle: 45,
  },
  rect1 = {
    x: 310,
    y: 980,
    w: 50,
    h: 50,
    vx: 0,
    vy: 0,
    size: 50,
    direction: 1,
    angle: 90,
  };
function roundedRect(ctx, x, y, width, height, radius) {
  ctx.beginPath();
  ctx.moveTo(x, y + radius);
  ctx.arcTo(x, y + height, x + radius, y + height, radius);
  ctx.arcTo(x + width, y + height, x + width, y + height - radius, radius);
  ctx.arcTo(x + width, y, x + width - radius, y, radius);
  ctx.arcTo(x, y, x, y + radius, radius);
  ctx.stroke();
}
function drawSquare(ctx, point) {
  const { x, w, size, direction, angle } = point;

  // Convert angle to radians
  const angleRad = (angle * Math.PI) / 180;

  // Calculate the direction factor
  const dirFactor = direction > 0 ? 1 : -1;

  // Calculate the other three points
  const p2 = {
    x: x + dirFactor * size * Math.cos(angleRad),
    y: x + dirFactor * size * Math.sin(angleRad),
  };
  const p3 = {
    x: p2.x + dirFactor * size * Math.cos(angleRad + Math.PI / 2),
    y: p2.y + dirFactor * size * Math.sin(angleRad + Math.PI / 2),
  };
  const p4 = {
    x: p3.x - dirFactor * size * Math.cos(angleRad),
    y: p3.y - dirFactor * size * Math.sin(angleRad),
  };

  // Draw the square
  ctx.beginPath();
  ctx.moveTo(x, x);
  ctx.lineTo(p2.x, p2.y);
  ctx.lineTo(p3.x, p3.y);
  ctx.lineTo(p4.x, p4.y);
  ctx.closePath();
  ctx.stroke();
}
function drawRectangle(ctx, point) {
  const { x, w, size, direction, angle } = point;

  // Convert angle to radians
  const angleRad = (angle * Math.PI) / 180;

  // Calculate the direction factor
  const dirFactor = direction > 0 ? 1 : -1;

  // Calculate the other three points
  const p2 = {
    x: x + dirFactor * size * Math.cos(angleRad),
    y: x + dirFactor * size * Math.sin(angleRad),
  };
  const p3 = {
    x: p2.x + dirFactor * w * Math.cos(angleRad + Math.PI / 2),
    y: p2.y + dirFactor * w * Math.sin(angleRad + Math.PI / 2),
  };
  const p4 = {
    x: p3.x - dirFactor * size * Math.cos(angleRad),
    y: p3.y - dirFactor * size * Math.sin(angleRad),
  };

  // Draw the rectangle
  ctx.beginPath();
  ctx.moveTo(x, x);
  ctx.lineTo(p2.x, p2.y);
  ctx.lineTo(p3.x, p3.y);
  ctx.lineTo(p4.x, p4.y);
  ctx.closePath();
  ctx.stroke();
}
function calculateSquareCorners(initialPoint, size, direction, angle) {
  // Convert angle to radians
  const radians = (angle * Math.PI) / 180;

  // Calculate the second corner (top-right)
  const x2 = initialPoint.x + size * Math.cos(radians) * direction;
  const y2 = initialPoint.y - size * Math.sin(radians) * direction;

  // Calculate the third corner (bottom-right)
  const x3 = x2 - size * Math.sin(radians) * direction;
  const y3 = y2 - size * Math.cos(radians) * direction;

  // Calculate the fourth corner (bottom-left)
  const x4 = initialPoint.x - size * Math.sin(radians) * direction;
  const y4 = initialPoint.y - size * Math.cos(radians) * direction;

  return [
    { x: x2, y: y2 },
    { x: x3, y: y3 },
    { x: x4, y: y4 },
  ];
}

const draw = () => {
  ctx.globalAlpha = 0.75;
  ctx.fillStyle = "rgba(36, 38, 45, 1)";
  ctx.clearRect(0, 0, canvas.width, canvas.height);
  ctx.fillRect(0, 0, canvas.width, canvas.height);
  ctx.globalAlpha = 1;
  ctx.strokeStyle = "hsl(220, 100%, 50%)";
  ctx.fillStyle = "hsl(220, 100%, 50%)";
  drawSquare(ctx, rect);
  drawRectangle(ctx, {
    x: 650,
    y: 650,
    w: 100,
    size: 50,
    direction: -1,
    angle: 45,
  });
  const initialPoint = { x: 350, y: 350 };
  const initialPoint1 = { x: 340, y: 360 };
  const size = 50;
  const direction = -1; // Negative for "behind" direction
  const angle = 45; // Angle in degrees

  const corners = calculateSquareCorners(initialPoint, size, direction, angle);
  const corners1 = calculateSquareCorners(initialPoint1, 50, direction, 0);
  // Draw the square
  ctx.beginPath();
  ctx.moveTo(initialPoint.x, initialPoint.y);
  corners.forEach((corner) => ctx.lineTo(corner.x, corner.y));
  ctx.closePath();
  ctx.stroke();

  // ctx.fillStyle = "hsl(180, 100%, 50%)";
  // Draw the square
  ctx.beginPath();
  ctx.moveTo(initialPoint1.x, initialPoint1.y);
  corners1.forEach((corner) => ctx.lineTo(corner.x, corner.y));
  ctx.closePath();
  ctx.stroke();

  let organism = {
    part1: [{ x: 250, y: 250 }, 50, 1, 0],
    part2: [{ x: 240, y: 260 }, 50, 1, 45],
  };
  const part1Corners = calculateSquareCorners(...organism.part1),
    part2Corners = calculateSquareCorners(...organism.part2);
  ctx.beginPath();
  ctx.moveTo(organism.part1[0].x, organism.part1[0].y);
  part1Corners.forEach((corner) => ctx.lineTo(corner.x, corner.y));
  ctx.closePath();
  ctx.stroke();

  ctx.beginPath();
  ctx.moveTo(organism.part2[0].x, organism.part2[0].y);
  part2Corners.forEach((corner) => ctx.lineTo(corner.x, corner.y));
  ctx.closePath();
  ctx.stroke();

  ctx.strokeStyle = "magenta";
  ctx.beginPath();
  ctx.roundRect(635, 150, 80, 100, [80, 80, 20, 20]);
  ctx.stroke();

  ctx.beginPath();
  ctx.arc(675, 150, 30, 0, 2 * Math.PI);
  ctx.stroke();

  ctx.strokeStyle = "magenta";
  ctx.beginPath();
  ctx.roundRect(800, 150, 100, 50, [10, 10, 10, 10]);
  ctx.stroke();

  ctx.beginPath();
  ctx.arc(800, 175, 30, 0, 2 * Math.PI);
  ctx.stroke();
  rAF = requestAnimationFrame(draw);
};
draw();
