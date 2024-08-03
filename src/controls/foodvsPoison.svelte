<script>
  import { store } from "../lib/appStore";

  let rAF,
    { ctx, canvas } = $store.canvas,
    rect = {
      x: 350,
      y: 350,
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

  const draw = () => {
    ctx.globalAlpha = 0.75;
    ctx.fillStyle = "rgba(36, 38, 45, 1)";
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    ctx.fillRect(0, 0, canvas.width, canvas.height);
    ctx.globalAlpha = 1;
    ctx.strokeStyle = "hsl(220, 100%, 50%)";
    drawSquare(ctx, rect);
    drawSquare(ctx, rect1);
    rAF = requestAnimationFrame(draw);
  };
  draw();
</script>
