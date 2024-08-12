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

class Vector {
  constructor(x, y) {
    this.x = x;
    this.y = y;
  }

  add(other) {
    this.x += other.x;
    this.y += other.y;
    return this;
  }

  subtract(other) {
    this.x -= other.x;
    this.y -= other.y;
    return this;
  }

  multiply(scalar) {
    this.x *= scalar;
    this.y *= scalar;
    return this;
  }
  divide(scalar) {
    this.x /= scalar;
    this.y /= scalar;
    return this;
  }

  magnitude() {
    return Math.sqrt(this.x * this.x + this.y * this.y);
  }

  normalize() {
    return this.divide(this.magnitude());
  }

  limit(l) {
    if (this.magnitude() > l) {
      this.setMagnitude(l);
    }
    return this;
  }
  setMagnitude(l) {
    const angle = this.angle();
    this.x = Math.cos(angle) * l;
    this.y = Math.sin(angle) * l;
    return this;
  }
  angle() {
    return Math.atan2(this.y, this.x);
  }
  copy() {
    return new Vector(this.x, this.y);
  }
  headingRads() {
    var h = Math.atan2(this.y, this.x);
    return h;
  }
  headingDegs() {
    var r = Math.atan2(this.y, this.x);
    var h = (r * 180.0) / Math.PI;
    return h;
  }
  rotateDegs(a) {
    a = (a * Math.PI) / 180.0;
    let newHead = this.headingRads() + a,
      magnitude = this.magnitude();
    this.x = Math.cos(newHead) * magnitude;
    this.y = Math.cos(newHead) * magnitude;
    return this;
  }
}

class Creature {
  constructor(x, y, headRadius, bodyWidth, bodyHeight) {
    this.x = x;
    this.y = y;
    this.position = new Vector(x, y);
    this.velocity = new Vector(0.2, 0.2);
    this.acceleration = new Vector(0, 0);
    this.maxSpeed = 5;
    this.maxForce = 0.1;
    this.headRadius = headRadius;
    this.bodyWidth = bodyWidth;
    this.bodyHeight = bodyHeight;

    // Determine which side is shorter
    this.shortSide = bodyWidth < bodyHeight ? "width" : "height";
  }
  moveCircularly = (radius, centerX, centerY) => {
    const angle = ((Date.now() / 1000) * Math.PI) / 2; // Adjust speed as needed
    this.x = centerX + radius * Math.cos(angle);
    this.y = centerY + radius * Math.sin(angle);
  };
  wander() {
    // Circle of randomness
    const circleRadius = 25;
    const randomAngle = Math.random() * Math.PI * 2;
    const randomOffset = new Vector(
      Math.cos(randomAngle) * circleRadius,
      Math.sin(randomAngle) * circleRadius
    );

    // Desired velocity
    const desiredVelocity = this.velocity
      .add(randomOffset)
      .normalize()
      .multiply(this.maxSpeed);

    // Steering force
    const steering = desiredVelocity
      .subtract(this.velocity)
      .limit(this.maxForce);

    // Apply steering
    this.acceleration = steering;
    // this.move();
  }
  draw() {
    // Draw the body
    ctx.beginPath();
    ctx.roundRect(
      this.x,
      this.y + this.headRadius,
      this.bodyWidth,
      this.bodyHeight,
      10
    );
    // ctx.arc(
    //   this.x +
    //     (this.shortSide === "width" ? this.bodyWidth : this.headRadius),
    //   this.y + this.headRadius,
    //   this.headRadius,
    //   Math.PI,
    //   Math.PI * 1.5
    // );
    ctx.fill();
    ctx.closePath();

    // Draw the head
    ctx.beginPath();
    ctx.arc(
      this.x + (this.shortSide === "width" ? 0 : this.headRadius),
      this.y,
      this.headRadius,
      0,
      Math.PI * 2
    );
    ctx.fill();
    ctx.closePath();
  }
  constrain() {
    const buffer = 50;
    const minX = this.headRadius + buffer;
    const maxX = canvas.width - this.bodyWidth - this.headRadius - buffer;
    const minY = this.headRadius + buffer;
    const maxY = canvas.height - this.bodyHeight - buffer;

    this.position.x = Math.max(minX, Math.min(maxX, this.position.x));
    this.position.y = Math.max(minY, Math.min(maxY, this.position.y));
  }
  move(dx, dy) {
    this.x += dx;
    this.y += dy;
    // this.position.add(this.velocity);
    // this.x += this.position.x;
    // this.y += this.position.y;
    // this.velocity.add(this.acceleration);
    // this.velocity.limit(this.maxSpeed);
    // this.acceleration.multiply(0);
    // this.constrain();
    // this.wander();
    // this.wrapAround();
  }
  wrapAround() {
    const canvasWidth = canvas.width;
    const canvasHeight = canvas.height;

    if (this.position.x > canvasWidth) {
      this.position.x = 0;
    } else if (this.position.x < 0) {
      this.position.x = canvasWidth;
    }

    if (this.position.y > canvasHeight) {
      this.position.y = 0;
    } else if (this.position.y < 0) {
      this.position.y = canvasHeight;
    }
  }
  applyForce = (force) => {
    this.acceleration.add(force);
  };
}

const creature = new Creature(
  getRandomFromRange(0, canvas.width),
  getRandomFromRange(0, canvas.height),
  20,
  50,
  30
);

function animate() {
  requestAnimationFrame(animate);
  ctx.clearRect(0, 0, canvas.width, canvas.height);

  creature.move(0.1, 0.1); // Adjust movement as needed
  creature.draw();
}

animate();

class Vector {
  constructor(x, y) {
    this.x = x;
    this.y = y;
  }

  add(other) {
    this.x += other.x;
    this.y += other.y;
    return this;
  }

  subtract(other) {
    this.x -= other.x;
    this.y -= other.y;
    return this;
  }

  multiply(scalar) {
    this.x *= scalar;
    this.y *= scalar;
    return this;
  }
  divide(scalar) {
    this.x /= scalar;
    this.y /= scalar;
    return this;
  }
  subtractNew(v) {
    var x = this.x - v.x;
    var y = this.y - v.y;
    return new Vector(x, y);
  }
  normalize() {
    return this.divide(this.magnitude());
  }
  magnitude() {
    return Math.sqrt(this.x * this.x + this.y * this.y);
  }

  limit(l) {
    if (this.magnitude() > l) {
      this.setMagnitude(l);
    }
    return this;
  }
  setMagnitude(l) {
    const angle = this.angle();
    this.x = Math.cos(angle) * l;
    this.y = Math.sin(angle) * l;
    return this;
  }
  angle() {
    return Math.atan2(this.y, this.x);
  }
  copy() {
    return new Vector(this.x, this.y);
  }
  dist(other) {
    let d = other.copy().subtract(this);
    return d.magnitude();
  }
  angleBetween(other) {
    return this.angle() - other.angle();
  }
  headingRads() {
    var h = Math.atan2(this.y, this.x);
    return h;
  }
  headingDegs() {
    var r = Math.atan2(this.y, this.x);
    var h = (r * 180.0) / Math.PI;
    return h;
  }
  rotateDegs(a) {
    a = (a * Math.PI) / 180.0;
    let newHead = this.headingRads() + a,
      magnitude = this.magnitude();
    this.x = Math.cos(newHead) * magnitude;
    this.y = Math.cos(newHead) * magnitude;
    return this;
  }
}
class Food {
  constructor(x, y, energy) {
    this.position = new Vector(x, y);
    this.velocity = new Vector(getRandomFloat(), getRandomFloat());
    this.energy = energy;
    this.dead = false;
    this.r = 4;
    this.c = `hsl(126, 100%, 50%)`;
    this.isFood = true;
  }
  draw(ctx) {
    if (this.dead) return;
    ctx.fillStyle = this.c;
    ctx.beginPath();
    ctx.arc(this.position.x, this.position.y, this.r, 0, 2 * Math.PI);
    ctx.closePath();
    ctx.fill();
  }

  update(environment) {
    const buffer = 50;
    this.position.add(this.velocity);
    // console.log(this.position);
    if (
      this.position.x > environment.width - buffer ||
      this.position.x < buffer ||
      this.position.y > environment.height - buffer ||
      this.position.y < buffer
    ) {
      this.energy = 0;
      this.dead = true;
    }
  }
}
class Creature {
  constructor(payload) {
    this.position = new Vector(payload.x, payload.y);
    this.body = {
      w: payload.body.w,
      h: payload.body.h,
      r: payload.body.r,
      c: payload.body.c,
    };
    this.head = {
      c: payload.head.c,
      r: payload.head.r,
    };
    this.velocity = new Vector(getRandomFloat(), getRandomFloat());
    this.acceleration = new Vector(0, 0);
    this.force = new Vector(getRandomFloat(), getRandomFloat());
    this.maxForce = getRandomFloat();
    this.maxVelocity = 8;
    this.wanderAngle = Math.random() * 360;
    this.lookRadius = 300;
    // this.maxForce < 0 ? (this.maxForce *= -1) : this.maxForce;
  }
  update(deltaTime) {
    this.acceleration = this.acceleration.add(
      this.force.multiply(this.maxForce)
    );

    // // Update velocity
    this.velocity = this.velocity
      .add(this.acceleration.multiply(this.maxForce))
      .limit(this.maxVelocity);

    // Ensure head leads
    this.ensureHeadLeads();
    //   this.moveWithHeadFirst();

    // Update position
    this.position = this.position.add(this.velocity);

    // Update body and head positions based on position
    this.body.x = this.position.x - this.body.w / 2;
    this.body.y = this.position.y - this.body.h / 2;
    this.head.x = this.position.x + this.body.w / 2;
    this.head.y = this.position.y;
    // this.acceleration.multiply(0);
    this.wander();
    this.boundaries();
    //   console.log(this.position);
  }
  rotatePoint(point, angle) {
    const cosAngle = Math.cos(angle);
    const sinAngle = Math.sin(angle);
    return {
      x: point.x * cosAngle - point.y * sinAngle,
      y: point.x * sinAngle + point.y * cosAngle,
    };
  }
  canSeeFood(food) {
    const dx = food.x - this.head.x,
      dy = food.y - this.head.y,
      distance = Math.sqrt(dx * dx + dy * dy);
    // console.log(distance);
    // Math.hypot(this.head.x - food.x, this.head.y - food.y);
    return distance < this.lookRadius;
  }
  chase = (target) => {
    let lookAheadTime = 0.5,
      predictedPosition = target.position
        .copy()
        .add(target.velocity.copy().multiply(lookAheadTime)),
      desiredSpeed = predictedPosition
        .subtractNew(this.position)
        .setMagnitude(this.maxVelocity);
    this.applyForce(
      desiredSpeed.subtractNew(this.velocity).limit(this.maxForce)
    );
  };
  considerFood(food) {
    let closeFood = [],
      angle = Math.PI * 2;
    food.forEach((foodObj) => {
      let diff = this.position.copy().subtract(foodObj.position),
        dist = this.position.dist(foodObj.position),
        a = this.velocity.angleBetween(diff);
      if (
        dist < this.lookRadius &&
        (a < angle / 2 || a > (Math.PI - angle) / 2)
      ) {
        closeFood.push(foodObj);
      }
    });
    // if (closeFood.length) console.log(closeFood);
    closeFood.forEach((foodObj) => {
      if (!foodObj.dead) {
        this.chase(foodObj);
        if (this.position.dist(foodObj.position) < foodObj.r + this.head.r) {
          console.log("Food eaten!");
          foodObj.dead = true;
        }
      }
    });
  }
  wander = () => {
    const circleRadius = 25;
    let displacement = new Vector(0, -1);
    displacement.multiply(circleRadius).rotateDegs(this.wanderAngle);

    // Desired velocity
    const desiredVelocity = this.velocity
      .add(displacement)
      .normalize()
      .multiply(this.maxVelocity);

    // Steering force
    const steering = desiredVelocity
      .subtract(this.velocity)
      .limit(this.maxForce);
    this.wanderAngle += Math.random() * 30 - 15;
    // Apply steering
    this.acceleration = steering;
  };
  ensureHeadLeads() {
    // Calculate velocity angle (in radians)
    const dx = this.body.x - this.head.x;
    const dy = this.body.y - this.head.y;
    const angle = Math.atan2(dy, dx);

    // Update head position
    this.head.x += Math.cos(angle) * this.maxVelocity;
    this.head.y += Math.sin(angle) * this.maxVelocity;

    // Update body position (attached to head)
    this.body.x = this.body.x;
    this.body.y = this.body.y + this.head.r + this.body.h / 2;
  }
  applyForce = (force) => {
    this.acceleration.add(force);
  };
  boundaries = () => {
    const canvasWidth = canvas.width;
    const canvasHeight = canvas.height;

    if (this.position.x > canvasWidth) {
      this.position.x = 0;
    } else if (this.position.x < 0) {
      this.position.x = canvasWidth;
    }

    if (this.position.y > canvasHeight) {
      this.position.y = 0;
    } else if (this.position.y < 0) {
      this.position.y = canvasHeight;
    }
  };
  draw = (ctx) => {
    const { x: bodyX, y: bodyY, w, h, r, c } = this.body;
    ctx.fillStyle = c;
    ctx.beginPath();
    ctx.roundRect(bodyX, bodyY, w, h, r);
    ctx.fill();
    const { x: headX, y: headY, r: headR, c: headC } = this.head;
    ctx.fillStyle = headC;
    ctx.beginPath();
    ctx.arc(headX, headY, headR, 0, Math.PI * 2);
    ctx.fill();
  };
}

const creatureVariables = () => ({
    x: getRandomFromRange(0, canvas.width),
    y: getRandomFromRange(0, canvas.height),
    body: { w: 50, h: 30, r: 10, c: "blue" },
    head: { c: "yellow", r: 15 },
  }),
  // creature = new Creature(creatureVariables),
  numFood = 30,
  numCreatures = 5,
  food = [],
  creatures = [];
[...Array(numCreatures).keys()].map(() => {
  creatures.push(new Creature(creatureVariables()));
});
[...Array(numFood).keys()].map(() => {
  food.push(
    new Food(
      getRandomFromRange(0, canvas.width),
      getRandomFromRange(0, canvas.height),
      getRandomFromRange(20, 60)
    )
  );
});
let previousTime = performance.now();
function animate() {
  const currentTime = performance.now();
  const deltaTime = (currentTime - previousTime) / 1000; // Convert to seconds
  previousTime = currentTime;

  ctx.clearRect(0, 0, canvas.width, canvas.height);
  for (let i = 0; i < food.length; i++) {
    if (food[i].dead) {
      food.splice(i, 1);
    } else {
      food[i].update(canvas);
      food[i].draw(ctx);
    }
  }
  if (food.length < numFood) {
    let foodObj = new Food(
      getRandomFromRange(0, canvas.width),
      getRandomFromRange(0, canvas.height),
      getRandomFromRange(1, 5)
    );
    food.push(foodObj);
  }
  for (let i = 0; i < creatures.length; i++) {
    let creature = creatures[i];
    creature.considerFood(food);
    creature.update(deltaTime);
    creature.draw(ctx);
  }

  // creature.moveWithHeadFirst();
  requestAnimationFrame(animate);
}

animate();
