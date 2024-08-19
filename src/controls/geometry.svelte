<script>
  import { store } from "../lib/appStore";
  import { Environment } from "../lib/projects/geometry/Environment";
  Environment.setup({
    canvas: $store.canvas.canvas,
    ctx: $store.canvas.ctx,
  });
</script>

<button class="f-sm rounded-sm" on:click={Environment.start}
  >Start Simulation</button
>
