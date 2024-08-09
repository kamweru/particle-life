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
  <div class="flex space-between">
    <span>Creatures</span>
    <span>{creatures.length}</span>
  </div>
  {#each creatures as creature}
    <div class="flex flex-column border gap-sm">
      <div class="flex space-between padding-xs">
        <span class="bg h-10 w-10" style="--bg: {creature.body.c}"></span>
        <span>energy:</span>
        {creature.energy.toFixed(2)}
      </div>
      <div class="flex space-between padding-xs">
        <span class="bg h-10 w-10" style="--bg: {creature.body.c}"></span>
        <span>mass:</span>
        {creature.mass.toFixed(2)}
      </div>
      <div class="flex space-between padding-xs">
        <span class="bg h-10 w-10" style="--bg: {creature.body.c}"></span>
        <span>mass v. energy:</span>
        {(creature.mass - creature.energy).toFixed(2)}
      </div>
    </div>
  {/each}
{/if}
