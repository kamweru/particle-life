<script>
  import { store } from "../lib/appStore";
  import { Vector } from "../lib/projects/circular/Vector";
  import { getRandomFloat, getRandomFromRange } from "../lib/utils";
  import { Circular } from "../lib/projects/circular/Circular";
  let creatures = [];
  //   const { canvas, ctx } = $store.canvas;
  //   ctx.translate(0.5, 0.5);
  Circular.setup({
    canvas: $store.canvas.canvas,
    ctx: $store.canvas.ctx,
  });

  setInterval(() => {
    creatures = Circular.getCreatures();
    // console.log(creatures);
  }, 100);
</script>

<button class="f-sm rounded-sm" on:click={Circular.start}
  >start simulation</button
>
<button class="f-sm rounded-sm" on:click={Circular.stop}>stop simulation</button
>
<button class="f-sm rounded-sm" on:click={Circular.addCreature}
  >add creature</button
>
{#if creatures && creatures.length > 0}
  {#each creatures as creature}
    <div class="flex flex-column border gap-sm">
      <div class="flex space-between padding-sm">
        <span>energy:</span>
        {creature.energy}
      </div>
      <div class="flex space-between padding-sm">
        <span>mass:</span>
        {creature.mass}
      </div>
    </div>
  {/each}
{/if}
