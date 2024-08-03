<script>
  import { store } from "../lib/appStore";
  import { ShapesEnvironment } from "../lib/projects/shapes/Oval";
  // if ($store.activeMenu !== "shapes") ShapesEnvironment.stop();
  ShapesEnvironment.setup({
    ctx: $store.canvas.ctx,
    canvas: $store.canvas.canvas,
    numOvals: 3,
    numFood: 60,
    quadtreeCapacity: 10,
  });
  ShapesEnvironment.init();
  ShapesEnvironment.start();
  // console.log(ShapesEnvironment.config.ovals);
</script>

shapes controls
