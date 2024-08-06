<script>
  import { store } from "../lib/appStore";
  import { Circular } from "../lib/projects/circular/Circular";
  Circular.setup({
    canvas: $store.canvas.canvas,
    ctx: $store.canvas.ctx,
  });
</script>

<button class="f-sm rounded-sm" on:click={Circular.start}
  >start simulation</button
>
<button class="f-sm rounded-sm" on:click={Circular.stop}>stop simulation</button
>
