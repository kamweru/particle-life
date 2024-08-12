<script>
  import { store } from "../lib/appStore";
  import { Evolve } from "../lib/projects/evolve/Evolve";
  Evolve.setup({
    ctx: $store.canvas.ctx,
    canvas: $store.canvas.canvas,
  });
  Evolve.start();
</script>
