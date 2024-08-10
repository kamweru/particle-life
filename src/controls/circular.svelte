<script>
  import { store } from "../lib/appStore";
  import { Circular } from "../lib/projects/circular/Circular";
  let creatures = [],
    frames = 0,
    evolutionTimer = 0,
    topCreaturesDivider = 4,
    evolver = 0;
  Circular.setup({
    canvas: $store.canvas.canvas,
    ctx: $store.canvas.ctx,
  });
  const start = () => {
    Circular.setup({
      canvas: $store.canvas.canvas,
      ctx: $store.canvas.ctx,
    });
    ({ evolver } = Circular.getData());
    Circular.start();
  };
  setInterval(() => {
    ({ frames, evolutionTimer, creatures } = Circular.getData());
  }, 100);
</script>

<div class="grid-cols-2 gap-sm padding-xs">
  <button class="f-sm rounded-sm" on:click={start}>start simulation</button>
  <button class="f-sm rounded-sm" on:click={Circular.stop}
    >stop simulation</button
  >
  <button class="f-sm rounded-sm" on:click={Circular.addCreature}
    >add creature</button
  >
  <!-- <button class="f-sm rounded-sm" on:click={Circular.runMutations}
    >run mutations</button
  > -->
</div>

<div class="grid-cols-2 gap-sm padding-xs">
  <input
    type="number"
    step="10"
    min="50"
    max="2000"
    bind:value={evolutionTimer}
    on:change={() => Circular.setup({ evolutionTimer: evolutionTimer })}
  />
  <input
    type="number"
    step="0.01"
    min="0.01"
    max="1"
    bind:value={evolver}
    on:change={() => Circular.setup({ evolver: evolver })}
  />
  <input
    type="number"
    step="0.01"
    min="0.01"
    max="1"
    bind:value={topCreaturesDivider}
    on:change={() =>
      Circular.setup({ topCreaturesDivider: topCreaturesDivider })}
  />
</div>
{#if creatures && creatures.length > 0}
  <div class="flex space-between padding-sm">
    <span>Frames</span>
    <span>{frames}</span>
  </div>
  <div class="flex space-between padding-sm">
    <span>Creatures</span>
    <span>{creatures.length}</span>
  </div>
  {#each creatures.sort((a, b) => b.fitness - a.fitness) as creature}
    <div class="flex flex-column border gap-sm padding-xs">
      <div class="flex space-between align-center flex-wrap">
        <div class="bg h-10 w-20" style="--bg: {creature.body.c}"></div>
        <div class="flex gap-sm padding-xs">
          <span>e:</span>
          {creature.energy.toFixed(2)}
        </div>
        <div class="flex gap-sm padding-xs">
          <!-- <span class="bg h-10 w-10" style="--bg: {creature.body.c}"></span> -->
          <span>m:</span>
          {creature.mass.toFixed(2)}
        </div>
        <div class="flex gap-sm padding-xs">
          <!-- <span class="bg h-10 w-10" style="--bg: {creature.body.c}"></span> -->
          <span>f:</span>
          {creature.fitness.toFixed(2)}
        </div>

        <div class="flex gap-sm padding-xs">
          <span>HR:</span>
          {creature.genome.genes.headRadius.toFixed(2)}
        </div>
        <div class="flex gap-sm padding-xs">
          <span>BR:</span>
          {creature.genome.genes.bodyRadius.toFixed(2)}
        </div>
      </div>
    </div>
  {/each}
{/if}
