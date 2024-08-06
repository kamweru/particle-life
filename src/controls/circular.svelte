<script>
  import { store } from "../lib/appStore";
  import { Vector } from "../lib/projects/circular/Vector";
  import { getRandomFloat, getRandomFromRange } from "../lib/utils";

  const { canvas, ctx } = $store.canvas;
  ctx.translate(0.5, 0.5);

  class Circle {
    constructor({ x, y }, radius) {
      this.x = x || 0;
      this.y = y || 0;
      this.radius = radius || 10;
    }
  }

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

  const circles = [];
  const foods = [],
    numFood = 30;

  // Creature: Head (smaller circle) and Body (bigger circle)
  circles.push(new Circle({ x: 0, y: 0 }, 10));
  circles.push(new Circle({ x: 200, y: 200 }, 30));
  [...Array(numFood).keys()].map(() => {
    // Adding some food items
    foods.push(
      new Food({
        x: getRandomFromRange(0, canvas.width),
        y: getRandomFromRange(0, canvas.height),
      })
    );
  });
  //   foods.push(new Food({ x: 250, y: 100 }));
  //   foods.push(new Food({ x: 300, y: 300 }));

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
  function checkAndEatFood(head, foods) {
    for (let i = 0; i < foods.length; i++) {
      const {
        position: { x: foodX, y: foodY },
      } = foods[i];
      const dist = Math.sqrt((head.x - foodX) ** 2 + (head.y - foodY) ** 2);
      if (dist < head.radius) {
        // Remove the food from the array
        foods.splice(i, 1);
        break;
      }
    }
  }

  function updateCreaturePosition(head, body, target) {
    let {
      position: { x: targetX, y: targetY },
    } = target;
    const angle = Math.atan2(targetY - body.y, targetX - body.x);
    const speed = 2; // Adjust speed as necessary

    body.x += Math.cos(angle) * speed;
    body.y += Math.sin(angle) * speed;

    // Keep head at a fixed distance from the body
    head.x = body.x + Math.cos(angle) * (body.radius + head.radius);
    head.y = body.y + Math.sin(angle) * (body.radius + head.radius);
  }

  var frame = 0;
  function render() {
    ctx.clearRect(0, 0, canvas.width, canvas.height);

    const head = circles[0];
    const body = circles[1];

    // Find nearest food
    const nearestFood = findNearestFood(head, foods);
    checkAndEatFood(head, foods);
    // if (nearestFood) {
    updateCreaturePosition(head, body, nearestFood);
    // }

    ctx.strokeStyle = "#333";
    ctx.lineWidth = 1;

    // Draw creature (head and body)
    circles.forEach(function ({ x, y, radius }) {
      ctx.strokeStyle = "hsl(172, 100%, 50%)";
      ctx.setLineDash([]);
      ctx.beginPath();
      ctx.ellipse(x, y, radius, radius, 0, 0, Math.PI * 2);
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
    // Draw food
    foods.forEach(function ({ position: { x, y }, radius }, index) {
      foods[index].update();
      ctx.fillStyle = "hsl(203, 100%, 50%)";
      ctx.beginPath();
      ctx.arc(x, y, radius, 0, Math.PI * 2);
      ctx.fill();
    });

    // if(foods.length < numFood)

    const [t1, t2, t3, t4] = getTangentPoints(circles[0], circles[1]);

    // Tangent lines
    ctx.beginPath();
    ctx.strokeStyle = "hsl(172, 100%, 50%)";
    ctx.lineWidth = 2;
    ctx.moveTo(t1.x, t1.y);
    ctx.lineTo(t2.x, t2.y);
    ctx.moveTo(t3.x, t3.y);
    ctx.lineTo(t4.x, t4.y);
    ctx.stroke();

    frame++;
    requestAnimationFrame(render);
  }

  render();
</script>

<!-- <button class="f-sm rounded-sm" on:click={Circular.start}
  >start simulation</button
>
<button class="f-sm rounded-sm" on:click={Circular.stop}>stop simulation</button
> -->
