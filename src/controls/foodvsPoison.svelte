<script>
  import { store } from "../lib/appStore";
  import { getRandomFloat, getRandomFromRange } from "../lib/utils";

  let rAF,
    { ctx, canvas } = $store.canvas;
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
</script>
