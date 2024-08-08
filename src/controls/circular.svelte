<script>
  import { store } from "../lib/appStore";
  import { Vector } from "../lib/projects/circular/Vector";
  import { getRandomFloat, getRandomFromRange } from "../lib/utils";
  import { Circular } from "../lib/projects/circular/Circular";

  //   const { canvas, ctx } = $store.canvas;
  //   ctx.translate(0.5, 0.5);
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
<button class="f-sm rounded-sm" on:click={Circular.addCreature}
  >add creature</button
>
