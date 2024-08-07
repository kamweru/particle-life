<script>
  import { store } from "../lib/appStore";
  import { Vector } from "../lib/projects/circular/Vector";
  import { getRandomFloat, getRandomFromRange } from "../lib/utils";

  const { canvas, ctx } = $store.canvas;
  ctx.translate(0.5, 0.5);

  class Food {
    constructor({ x, y }) {
      this.position = new Vector(x, y);
      this.velocity = new Vector(getRandomFloat(), getRandomFloat());
      this.radius = 5;
    }
    update() {
      this.position.add(this.velocity);
    }
  }
  class Creature {
    constructor(headPos, headRadius, bodyPos, bodyRadius) {
      this.head = { x: headPos.x, y: headPos.y, radius: headRadius };
      this.body = { x: bodyPos.x, y: bodyPos.y, radius: bodyRadius };
      this.velocity = new Vector(0, 0);
      this.acceleration = new Vector(0, 0);
      this.wandering = new Vector(0.2, 0.2);
      this.avoidance = 50;
      this.maxForce = 0.5;
      this.maxVelocity = 5;
      this.separate = false;
    }

    update(target, foods) {
      let {
        position: { x, y },
      } = target;
      //   if (this.separate) {
      //     this.acceleration.multiply(0.9);
      //     this.separate = false;
      //   } else {
      //     this.wander();
      //   }

      const dist = Math.sqrt((this.body.x - x) ** 2 + (this.body.y - y) ** 2);

      if (dist < this.body.radius) {
        // Remove the food if it's too close to the body
        foods.splice(foods.indexOf(target), 1);
        return;
      }

      const angle = Math.atan2(y - this.body.y, x - this.body.x);
      this.body.x += Math.cos(angle) * this.maxVelocity;
      this.body.y += Math.sin(angle) * this.maxVelocity;

      // Keep head at a fixed distance from the body
      this.head.x =
        this.body.x + Math.cos(angle) * (this.body.radius + this.head.radius);
      this.head.y =
        this.body.y + Math.sin(angle) * (this.body.radius + this.head.radius);

      if (dist < this.head.radius) {
        foods.splice(foods.indexOf(target), 1);
      }
      //   const angle = Math.atan2(y - this.body.y, x - this.body.x);
      //   this.body.x += Math.cos(angle) * this.maxVelocity;
      //   this.body.y += Math.sin(angle) * this.maxVelocity;
      //   // Keep head at a fixed distance from the body
      //   this.head.x =
      //     this.body.x + Math.cos(angle) * (this.body.radius + this.head.radius);
      //   this.head.y =
      //     this.body.y + Math.sin(angle) * (this.body.radius + this.head.radius);

      //   const dist = Math.sqrt((this.head.x - x) ** 2 + (this.head.y - y) ** 2);
      //   if (dist < this.head.radius) {
      //     foods.splice(foods.indexOf(target), 1);
      //   }
    }

    wander = () => {
      // Normalize the wandering vector
      this.wandering.normalize();

      // Adjust the acceleration based on the wandering vector
      this.acceleration.add(this.wandering);

      // Update velocity (multiply by a small time step)
      const timeStep = 0.1; // Adjust as needed
      this.velocity.add(this.acceleration.multiply(timeStep));

      // Limit maximum speed (optional)
      const maxSpeed = 5; // Adjust as needed
      this.velocity.limit(maxSpeed);

      // Update position
      this.body.x += this.velocity.x;
      this.body.y += this.velocity.y;

      // Reset acceleration
      this.acceleration.set(0, 0);

      // Apply wandering effect to head as well
      this.head.x =
        this.body.x +
        Math.cos(this.velocity.angle()) * (this.body.radius + this.head.radius);
      this.head.y =
        this.body.y +
        Math.sin(this.velocity.angle()) * (this.body.radius + this.head.radius);
    };

    checkCollision = (creatures) => {
      for (const otherCreature of creatures) {
        if (this !== otherCreature) {
          const distance = Math.hypot(
            this.body.x - otherCreature.body.x,
            this.body.y - otherCreature.body.y
          );
          if (
            distance <
            this.avoidance + otherCreature.body.radius + this.body.radius
          ) {
            this.separate = true;
            const angle = Math.atan2(
              otherCreature.body.y - this.body.y,
              otherCreature.body.x - this.body.x
            );
            const desiredSeparation = new Vector(
              Math.cos(angle),
              Math.sin(angle)
            ).multiply(-10); // Adjust magnitude as needed
            this.acceleration.add(desiredSeparation);
            // const angle = Math.atan2(
            //   otherCreature.body.y - this.body.y,
            //   otherCreature.body.x - this.body.x
            // );
            // // Calculate the opposite direction from the other creature
            // const oppositeAngle = angle + Math.PI;

            // // Adjust acceleration to move away from the other creature
            // this.acceleration.x += Math.cos(oppositeAngle);
            // this.acceleration.y += Math.sin(oppositeAngle);
            // this.acceleration.x -= Math.cos(angle);
            // this.acceleration.y -= Math.sin(angle);
            this.wander();
          }
        }
      }
    };
  }
  const creatures = [],
    foods = [],
    numFood = 40,
    numCreatures = 1;

  [...Array(numCreatures).keys()].map((i) => {
    let adder = 10;
    creatures.push(
      new Creature(
        { x: 0 + i * adder, y: 0 + i * adder },
        adder,
        { x: 200 + i * adder, y: 200 + i * adder },
        30
      )
    );
    // console.log(i);
  });

  [...Array(numFood).keys()].map(() => {
    foods.push(
      new Food({
        x: getRandomFromRange(0, canvas.width),
        y: getRandomFromRange(0, canvas.height),
      })
    );
  });
  const addCreature = () => {
    let adder = 10,
      i = 1;
    creatures.push(
      new Creature(
        { x: 0 + i * adder, y: 0 + i * adder },
        adder,
        { x: 200 + i * adder, y: 200 + i * adder },
        30
      )
    );
  };
  function getTangentPoints(c1, c2) {
    const { atan, asin, cos, PI, sin, sqrt } = Math;
    if (c1.x > c2.x) {
      let temp = c1;
      c1 = c2;
      c2 = temp;
    }
    const { x: x1, y: y1, radius: r1 } = c1;
    const { x: x2, y: y2, radius: r2 } = c2;
    const gamma = atan((y1 - y2) / (x2 - x1));
    const beta = asin((r2 - r1) / sqrt((x2 - x1) ** 2 + (y2 - y1) ** 2));
    const alpha = gamma - beta;
    const theta = gamma + beta;
    const t1 = {
      x: x1 + r1 * cos(PI / 2 - alpha),
      y: y1 + r1 * sin(PI / 2 - alpha),
    };
    const t2 = {
      x: x2 + r2 * cos(PI / 2 - alpha),
      y: y2 + r2 * sin(PI / 2 - alpha),
    };
    const t3 = {
      x: x1 + r1 * cos(-PI / 2 - theta),
      y: y1 + r1 * sin(-PI / 2 - theta),
    };
    const t4 = {
      x: x2 + r2 * cos(-PI / 2 - theta),
      y: y2 + r2 * sin(-PI / 2 - theta),
    };
    return [t1, t2, t3, t4];
  }

  function findNearestFood(head, foods) {
    let nearestFood = null;
    let minDist = Infinity;
    foods.forEach((food) => {
      let {
        position: { x: foodX, y: foodY },
      } = food;
      const dist = Math.sqrt((head.x - foodX) ** 2 + (head.y - foodY) ** 2);
      if (dist < minDist) {
        minDist = dist;
        nearestFood = food;
      }
    });
    return nearestFood;
  }

  var frame = 0;
  function render() {
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    creatures.forEach((creature, index) => {
      const { head, body } = creature;

      const nearestFood = findNearestFood(head, foods);
      //   checkAndEatFood(head, foods);

      if (nearestFood) {
        creature.update(nearestFood, foods);
      }
      //   else {
      //     creature.wander();
      //   }
      creature.checkCollision(creatures);
      // creature.wander();
      [head, body].forEach(function ({ x, y, radius }) {
        ctx.strokeStyle = "hsl(172, 100%, 50%)";
        ctx.setLineDash([]);
        ctx.beginPath();
        ctx.ellipse(x, y, radius, radius, 0, 0, Math.PI * 2);
        ctx.stroke();
      });

      const [t1, t2, t3, t4] = getTangentPoints(creature.head, creature.body);

      ctx.beginPath();
      ctx.strokeStyle = "hsl(172, 100%, 50%)";
      ctx.lineWidth = 2;
      ctx.moveTo(t1.x, t1.y);
      ctx.lineTo(t2.x, t2.y);
      ctx.moveTo(t3.x, t3.y);
      ctx.lineTo(t4.x, t4.y);
      ctx.stroke();
    });
    let buffer = 50;
    for (let i = 0; i < foods.length; i++) {
      if (
        foods[i].position.x > canvas.width - buffer ||
        foods[i].position.x < buffer ||
        foods[i].position.y > canvas.height - buffer ||
        foods[i].position.y < buffer
      ) {
        foods.splice(i, 1);
      }
    }
    if (foods.length < numFood) {
      foods.push(
        new Food({
          x: getRandomFromRange(0, canvas.width),
          y: getRandomFromRange(0, canvas.height),
        })
      );
    }

    foods.forEach(function ({ position: { x, y }, radius }, index) {
      foods[index].update();
      ctx.fillStyle = "hsl(203, 100%, 50%)";
      ctx.beginPath();
      ctx.arc(x, y, radius, 0, Math.PI * 2);
      ctx.fill();
    });

    frame++;
    requestAnimationFrame(render);
  }

  render();
</script>

<button class="f-sm rounded-sm" on:click={addCreature}>add Creature</button>
<!-- <button class="f-sm rounded-sm" on:click={Circular.start}
  >start simulation</button
>
<button class="f-sm rounded-sm" on:click={Circular.stop}>stop simulation</button
> -->
