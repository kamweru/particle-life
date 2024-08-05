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
</script>
