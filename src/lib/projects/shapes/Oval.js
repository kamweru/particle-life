import { getRandomFloat, getRandomFromRange, range } from "../../utils";
import { Vector } from "../organisms/Vector";
import { Quadtree } from "./QuadTree";
let colorsArr = [...range(0, 200), ...range(264, 360)];
class Oval {
  constructor(x, y, r1, r2, color) {
    this.position = new Vector(x, y);
    this.r1 = r1 * 0.6125;
    this.r2 = r2 * 1.6125;
    this.velocity = new Vector(getRandomFloat(), getRandomFloat());
    this.maxVelocity = 3.8;
    this.color = color;
    this.acceleration = new Vector(0, 0);
    this.maxForce = 5;
    this.wanderAngle = Math.random() * 360;
    this.energy = 1;
    this.seeRange = getRandomFromRange(60, 80);
    this.wandering = true;
    this.eating = false;
  }
  draw = (ctx) => {
    ctx.fillStyle = `hsl(${this.color}, 100%, 50%)`;
    ctx.beginPath();
    ctx.ellipse(
      this.position.x,
      this.position.y,
      this.r1,
      this.r2,
      this.velocity.headingRads() - Math.PI / 2,
      0,
      2 * Math.PI
    );
    ctx.fill();
  };
  update = () => {
    this.position.x += this.velocity.x;
    this.position.y += this.velocity.y;
    this.velocity.add(this.acceleration);
    this.velocity.limit(this.maxVelocity);
    this.acceleration.mul(0);
    // if (this.wandering)
    this.wander();
  };
  wander = () => {
    let circleCenter = this.velocity.copy().normalise(),
      displacement = new Vector(0, -1),
      wanderForce = new Vector(0, 0);
    displacement.mul(1);
    displacement.rotateDegs(this.wanderAngle);
    this.wanderAngle += Math.random() * 30 - 15;
    wanderForce = circleCenter.add(displacement);
    wanderForce.mul(0.4);
    if (this.eating) wanderForce.mul(0.005);
    this.applyForce(wanderForce);
  };
  chase = (target) => {
    // Calculate the desired velocity based on the target's predicted position
    let lookAheadTime = 0.5; // Adjust this value as needed
    let predictedPosition = target.position
      .copy()
      .add(target.velocity.copy().mul(lookAheadTime));
    let desiredSpeed = predictedPosition.subNew(this.position);
    desiredSpeed.setMag(this.maxVelocity);

    // Calculate the steering force
    let steering = desiredSpeed.subNew(this.velocity);
    steering.limit(this.maxForce);
    this.applyForce(steering);
    // let desiredSpeed = target.position.subNew(this.position);
    // desiredSpeed.setMag(this.maxVelocity);
    // let redirection = desiredSpeed.subNew(this.velocity);
    // redirection.limit(this.maxForce);
    // // console.log(redirection, target);
    // this.applyForce(redirection);
  };
  boundaries = (canvas) => {
    const buffer = 50; // Buffer distance from the canvas edges
    let desiredVelocity = null;
    if (this.position.x - Math.max(this.r1, this.r2) < buffer) {
      desiredVelocity = new Vector(this.maxVelocity, this.velocity.y);
      // this.applyForce(new Vector(this.maxForce * 3, 0));
    }
    if (this.position.x + Math.max(this.r1, this.r2) > canvas.width - buffer) {
      desiredVelocity = new Vector(-this.maxVelocity, this.velocity.y);
      // this.applyForce(new Vector(-this.maxForce * 3, 0));
    }
    if (this.position.y - Math.max(this.r1, this.r2) < buffer) {
      desiredVelocity = new Vector(this.velocity.x, this.maxVelocity);
      // this.applyForce(new Vector(0, this.maxForce * 3));
    }
    if (this.position.y + Math.max(this.r1, this.r2) > canvas.height - buffer) {
      desiredVelocity = new Vector(this.velocity.x, -this.maxVelocity);
      // this.applyForce(new Vector(0, -this.maxForce * 3));
    }
    if (desiredVelocity !== null) {
      desiredVelocity.normalise();
      desiredVelocity.mul(this.maxVelocity);
      let redirection = desiredVelocity.sub(this.velocity);
      redirection.limit(this.maxForce * 3);
      if (Number.isNaN(redirection.x)) redirection.x = getRandomFloat();
      if (Number.isNaN(redirection.y)) redirection.y = getRandomFloat();
      this.applyForce(redirection);
    }
  };
  getBounds() {
    let rotation = this.velocity.headingRads() - Math.PI / 2;
    // Calculate the major and minor radii
    const majorRadius = Math.max(this.r1, this.r2);
    const minorRadius = Math.min(this.r1, this.r2);

    // Calculate the bounding box coordinates
    const left = this.position.x - majorRadius;
    const top = this.position.y - minorRadius;
    const right = this.position.x + majorRadius;
    const bottom = this.position.y + minorRadius;

    // Apply rotation (if any)
    const cosTheta = Math.cos(rotation);
    const sinTheta = Math.sin(rotation);
    const rotatedLeft =
      this.position.x +
      (left - this.position.x) * cosTheta -
      (top - this.position.y) * sinTheta;
    const rotatedTop =
      this.position.y +
      (left - this.position.x) * sinTheta +
      (top - this.position.y) * cosTheta;
    const rotatedRight =
      this.position.x +
      (right - this.position.x) * cosTheta -
      (bottom - this.position.y) * sinTheta;
    const rotatedBottom =
      this.position.y +
      (right - this.position.x) * sinTheta +
      (bottom - this.position.y) * cosTheta;

    // Calculate width and height
    const width = Math.abs(rotatedRight - rotatedLeft);
    const height = Math.abs(rotatedBottom - rotatedTop);
    // console.log({
    //   x: rotatedLeft,
    //   y: rotatedTop,
    //   width,
    //   height,
    // });
    // Return the bounding box object
    return {
      x: rotatedLeft,
      y: rotatedTop,
      width,
      height,
    };
    // return {
    //   x: this.position.x - this.r1,
    //   y: this.position.y - this.r2,
    //   width: this.r1 * 2,
    //   height: this.r2 * 2,
    // };
  }

  isCollidingWith(otherShape) {
    const boundsA = this.getBounds();
    const boundsB = otherShape.getBounds();
    return !(
      boundsA.x > boundsB.x + boundsB.width ||
      boundsA.x + boundsA.width < boundsB.x ||
      boundsA.y > boundsB.y + boundsB.height ||
      boundsA.y + boundsA.height < boundsB.y
    );
  }
  eat(food) {
    // if (this.isCollidingWith(food)) {
    this.energy += food.energy; // Gain energy from the food
    food.dead = true; // Mark the food as dead
    // }
  }
  // getBounds = () => {
  //   // Calculate the bounding box dimensions based on ellipse radii and rotation
  //   let rotation = this.velocity.headingRads() - Math.PI / 2;

  //   // Calculate the bounding box coordinates without rotation
  //   const unrotatedX = this.position.x - this.r1;
  //   const unrotatedY = this.position.y - this.r2;
  //   const unrotatedWidth = 2 * this.r1;
  //   const unrotatedHeight = 2 * this.r2;

  //   // Calculate the four corners of the bounding box
  //   const corners = [
  //     { x: unrotatedX, y: unrotatedY },
  //     { x: unrotatedX + unrotatedWidth, y: unrotatedY },
  //     { x: unrotatedX, y: unrotatedY + unrotatedHeight },
  //     { x: unrotatedX + unrotatedWidth, y: unrotatedY + unrotatedHeight },
  //   ];

  //   // Rotate the corners around the center of the ellipse
  //   const rotatedCorners = corners.map((corner) => {
  //     const dx = corner.x - this.position.x;
  //     const dy = corner.y - this.position.y;
  //     const distance = Math.sqrt(dx * dx + dy * dy);
  //     const angle = Math.atan2(dy, dx) + rotation;
  //     return {
  //       x: this.position.x + distance * Math.cos(angle),
  //       y: this.position.y + distance * Math.sin(angle),
  //     };
  //   });

  //   // Calculate the min and max x and y values from the rotated corners
  //   const minX = Math.min(...rotatedCorners.map((c) => c.x));
  //   const minY = Math.min(...rotatedCorners.map((c) => c.y));
  //   const maxX = Math.max(...rotatedCorners.map((c) => c.x));
  //   const maxY = Math.max(...rotatedCorners.map((c) => c.y));

  //   // Calculate the width and height of the bounding box
  //   const width = maxX - minX;
  //   const height = maxY - minY;
  //   // console.log({
  //   //   x: minX,
  //   //   y: minY,
  //   //   width: width,
  //   //   height: height,
  //   // });
  //   return {
  //     x: minX,
  //     y: minY,
  //     width: width,
  //     height: height,
  //   };
  // };
  applyForce = (force) => {
    this.acceleration.add(force);
  };
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
  getBounds() {
    return {
      x: this.position.x - this.r,
      y: this.position.y - this.r,
      width: this.r * 2,
      height: this.r * 2,
    };
  }

  isCollidingWith(otherShape) {
    const boundsA = this.getBounds();
    const boundsB = otherShape.getBounds();
    return !(
      boundsA.x > boundsB.x + boundsB.width ||
      boundsA.x + boundsA.width < boundsB.x ||
      boundsA.y > boundsB.y + boundsB.height ||
      boundsA.y + boundsA.height < boundsB.y
    );
  }
}
class Circle {
  constructor(x, y, r) {
    this.x = x;

    this.y = y;
    this.r = r;
    this.width = r * 2;
    this.height = r * 2;
  }

  // Check if the point is contained within its limits (boundaries)
  containPoint(point) {
    let xPoint = point.position.x;
    let yPoint = point.position.y;
    // console.log(xPoint, yPoint, this.x, this.y, this.r);
    return (
      Math.sqrt(Math.pow(xPoint - this.x, 2) + Math.pow(yPoint - this.y, 2)) <=
      this.r // If the distance from the point to the circle is less than or equal to the radius
    );
  }

  // Method to find out if the rectangles intersect
  intersepta(range) {
    return !(
      // If this expression is true, they do NOT intersect

      (
        range.x - range.w > this.x + this.w ||
        range.x + range.w < this.x - this.w ||
        range.y - range.h > this.y + this.h ||
        range.y + range.h < this.y - this.h
      )
    );
  }
}
export const ShapesEnvironment = (() => {
  let config = { ovals: [], food: [] };
  // Instantiate the quadtree with a certain capacity
  let quadtree = undefined;
  const setup = (payload) => {
    for (let key in payload) {
      config[key] = payload[key];
    }

    // quadtree = new Quadtree(
    //   { x: 0, y: 0, width: config.canvas.width, height: config.canvas.height },
    //   quadtreeCapacity
    // );
  };
  const createOval = (x, y, r1, r2, color) => new Oval(x, y, r1, r2, color);
  const init = () => {
    let {
      canvas: { width, height },
    } = config;
    [...Array(config.numOvals).keys()].map(() => {
      let oval = createOval(
        getRandomFromRange(0, width),
        getRandomFromRange(0, height),
        getRandomFromRange(8, 12),
        getRandomFromRange(8, 12),
        colorsArr[getRandomFromRange(0, colorsArr.length - 1)]
      );
      config.ovals.push(oval);
      // quadtree.insert(oval);
    });
    [...Array(config.numFood).keys()].map(() => {
      let food = new Food(
        getRandomFromRange(0, width),
        getRandomFromRange(0, height),
        getRandomFromRange(1, 5)
      );
      config.food.push(food);
      // quadtree.insert(food);
    });
    // console.log(quadtree.shapes);
  };
  const handleCollisions = () => {
    const mergedShapes = [];
    let { ovals, food } = config,
      allShapes = [...ovals, ...food];
    for (let i = 0; i < ovals.length; i++) {
      let merged = false;

      for (let j = i + 1; j < allShapes.length; j++) {
        if (allShapes[i].isCollidingWith(ovals[j])) {
          const mergedShape = allShapes[i].mergeWith(allShapes[j]);
          if (mergedShape) {
            mergedShapes.push(mergedShape);
            allShapes.splice(j, 1);
            merged = true;
            break;
          }
        }
      }
      if (!merged) {
        mergedShapes.push(allShapes[i]);
      }
    }
    return mergedShapes;
  };
  function handleCollisionsAndFeeding(ovals) {
    let record = Infinity,
      closest = -1;
    for (let oval of ovals) {
      let foods = quadtree.searchFood(
        new Circle(oval.position.x, oval.position.y, oval.seeRange)
      );
      for (let i = 0; i < foods.length; i++) {
        let d =
          Math.pow(oval.position.x - foods[i].position.x, 2) +
          Math.pow(oval.position.y - foods[i].position.y, 2);
        if (d < record) {
          record = d;
          closest = i;
        }
      }
      if (record <= Math.pow(oval.seeRange, 2) && foods[closest]) {
        if (record < 10) {
          oval.eating = true;
          oval.eat(foods[closest]);
          console.log("eat", record);
        } else if (foods.length !== 0) {
          oval.chase(foods[closest]);
          console.log("chase", foods[closest]);
        }
      }
    }
  }
  const loop = () => {
    let { canvas, ctx, quadtreeCapacity } = config;
    ctx.globalAlpha = 0.75;
    ctx.fillStyle = "rgba(36, 38, 45, 1)";
    ctx.fillRect(0, 0, canvas.width, canvas.height);
    ctx.globalAlpha = 1;

    quadtree = new Quadtree(
      { x: 0, y: 0, width: config.canvas.width, height: config.canvas.height },
      quadtreeCapacity
    );
    quadtree.shapes = [];
    for (let i = 0; i < config.ovals.length; i++) {
      config.ovals[i].boundaries(canvas);
      config.ovals[i].update();
      config.ovals[i].draw(ctx);
    }
    for (let i = 0; i < config.food.length; i++) {
      if (config.food[i].dead) {
        config.food.splice(i, 1);
      } else {
        config.food[i].update(canvas);
        config.food[i].draw(ctx);
      }
    }
    if (config.food.length < config.numFood) {
      let food = new Food(
        getRandomFromRange(0, canvas.width),
        getRandomFromRange(0, canvas.height),
        getRandomFromRange(1, 5)
      );
      config.food.push(food);
    }
    config.ovals.forEach((oval) => {
      quadtree.insert(oval);
    });
    config.food.forEach((food) => {
      quadtree.insert(food);
    });
    handleCollisionsAndFeeding(config.ovals);

    quadtree.draw(ctx);
    config.rAF = requestAnimationFrame(loop);
  };
  const start = () => loop();
  const stop = () => {
    if (config.rAF) {
      cancelAnimationFrame(config.rAF);
      config.rAF = undefined;
    }
  };
  return {
    config,
    init,
    start,
    stop,
    setup,
  };
})();
