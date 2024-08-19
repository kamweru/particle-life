import { getRandomFromRange } from "../utils";
import { Vector } from "./VectorClass";

class ShapeClass {
  constructor(x, y, c, genome) {
    this.position = new Vector(x, y);
    this.velocity = new Vector(0, 0);
    this.acceleration = new Vector(0, 0);
    this.wanderAngle = getRandomFromRange(0, 360);
    this.maxSpeed = 3.8;
    this.maxForce = 5;
    this.c = c;
    this.genome = genome || {};
    this.currentTargetIndex = 0;
  }

  applyForce(force) {
    this.acceleration.add(force);
  }

  update(target) {
    const input = [
        this.position.x - target.position.x,
        this.position.y - target.position.y,
      ],
      output = this.genome.network.feedForward(input),
      steeringForce = new Vector(
        (output[0] * 2 - 1) * this.maxForce,
        (output[1] * 2 - 1) * this.maxForce
      );
    // steeringForce.rotateDegs(this.wanderAngle);
    // this.wanderAngle += Math.random() * 30 - 15;
    this.applyForce(steeringForce);
    this.velocity.add(this.acceleration);
    this.velocity.limit(this.maxSpeed);
    this.position.add(this.velocity);
    this.acceleration.multiply(0);
  }

  draw(ctx) {
    throw new Error("draw() method must be implemented by the subclass");
  }

  // Abstract collision method
  checkCollision(otherShape) {
    throw new Error(
      "checkCollision() method must be implemented by the subclass"
    );
  }
}

class Circle extends ShapeClass {
  constructor(x, y, r, c) {
    super(x, y, c);
    this.r = r;
    this.h = 2 * this.r;
    this.w = 2 * this.r;
  }

  draw(ctx) {
    ctx.beginPath();
    ctx.arc(this.position.x, this.position.y, this.r, 0, Math.PI * 2);
    ctx.fillStyle = this.c;
    ctx.fill();
    ctx.closePath();
  }

  // Check collision with another shape
  checkCollision(otherShape) {
    if (otherShape instanceof Circle) {
      return this.checkCollisionCircle(otherShape);
    } else if (otherShape instanceof Rectangle) {
      return this.checkCollisionRectangle(otherShape);
    }
    // Add more collision types if necessary
    return false;
  }

  // Circle vs Circle collision
  checkCollisionCircle(otherCircle) {
    const distance = this.position.distanceTo(otherCircle.position);
    return distance <= this.r + otherCircle.r;
  }

  // Circle vs Rectangle collision
  checkCollisionRectangle(rectangle) {
    const closestX = Math.max(
      rectangle.position.x,
      Math.min(this.position.x, rectangle.position.x + rectangle.w)
    );
    const closestY = Math.max(
      rectangle.position.y,
      Math.min(this.position.y, rectangle.position.y + rectangle.h)
    );
    const distanceX = this.position.x - closestX;
    const distanceY = this.position.y - closestY;
    const distance = Math.sqrt(distanceX * distanceX + distanceY * distanceY);
    return distance <= this.r;
  }
}

class Rectangle extends ShapeClass {
  constructor(x, y, w, h, c) {
    super(x, y, c);
    this.w = w;
    this.h = h;
  }

  draw(ctx) {
    ctx.beginPath();
    ctx.rect(this.position.x, this.position.y, this.w, this.h);
    ctx.fillStyle = this.c;
    ctx.fill();
    ctx.closePath();
  }

  // Check collision with another shape
  checkCollision(otherShape) {
    if (otherShape instanceof Circle) {
      return otherShape.checkCollisionRectangle(this);
    } else if (otherShape instanceof Rectangle) {
      return this.checkCollisionRectangle(otherShape);
    }
    return false;
  }

  // Rectangle vs Rectangle collision
  checkCollisionRectangle(otherRectangle) {
    return !(
      otherRectangle.position.x > this.position.x + this.w ||
      otherRectangle.position.x + otherRectangle.w < this.position.x ||
      otherRectangle.position.y > this.position.y + this.h ||
      otherRectangle.position.y + otherRectangle.h < this.position.y
    );
  }
}

class Ellipse extends ShapeClass {
  constructor(x, y, r, c, genome) {
    super(x, y, c, genome);
    this.r1 = r;
    this.r2 = this.r1 * 1.625;
    this.h = 2 * this.r2;
    this.w = 2 * this.r1;
  }

  draw(ctx) {
    ctx.beginPath();
    ctx.ellipse(
      this.position.x,
      this.position.y,
      this.r1,
      this.r2,
      this.velocity.headingRads() - Math.PI / 2,
      0,
      Math.PI * 2
    );
    ctx.fillStyle = this.c;
    ctx.fill();
    ctx.closePath();
  }

  // Simplified ellipse collision detection
  checkCollision(otherShape) {
    if (otherShape instanceof Circle) {
      return this.checkCollisionCircle(otherShape);
    } else if (otherShape instanceof Rectangle) {
      return this.checkCollisionRectangle(otherShape);
    }
    // Add more collision types if necessary
    return false;
  }

  // Ellipse vs Circle collision (approximation using bounding box)
  checkCollisionCircle(circle) {
    const boundingBox = {
      x: this.position.x - this.r1,
      y: this.position.y - this.r2,
      w: this.r1 * 2,
      h: this.r2 * 2,
    };
    const closestX = Math.max(
      boundingBox.x,
      Math.min(circle.position.x, boundingBox.x + boundingBox.w)
    );
    const closestY = Math.max(
      boundingBox.y,
      Math.min(circle.position.y, boundingBox.y + boundingBox.h)
    );
    const distanceX = circle.position.x - closestX;
    const distanceY = circle.position.y - closestY;
    const distance = Math.sqrt(distanceX * distanceX + distanceY * distanceY);
    return distance <= circle.r;
  }

  // Ellipse vs Rectangle collision (approximation using bounding box)
  checkCollisionRectangle(rectangle) {
    const boundingBox = {
      x: this.position.x - this.r1,
      y: this.position.y - this.r2,
      w: this.r1 * 2,
      h: this.r2 * 2,
    };
    return !(
      rectangle.position.x > boundingBox.x + boundingBox.w ||
      rectangle.position.x + rectangle.w < boundingBox.x ||
      rectangle.position.y > boundingBox.y + boundingBox.h ||
      rectangle.position.y + rectangle.h < boundingBox.y
    );
  }
}

export { Circle, Rectangle, Ellipse };
