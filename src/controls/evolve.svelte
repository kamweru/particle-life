<script>
  import { store } from "../lib/appStore";
  // import { Propeller } from "../lib/projects/evolve/Propeller";
  // Propeller.setup({
  //   canvas: $store.canvas.canvas,
  //   ctx: $store.canvas.ctx,
  // });
  import { Evolve } from "../lib/projects/evolve/Evolve";
  Evolve.setup({
    ctx: $store.canvas.ctx,
    canvas: $store.canvas.canvas,
  });
  Evolve.start();
</script>
