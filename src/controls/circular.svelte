<script>
  import { store } from "../lib/appStore";
  import { Circular } from "../lib/projects/circular/Circular";
  import { weightSetup, getConfig } from "../lib/projects/circular/Genome";
  let creatures = [],
    frames = 0,
    evolutionTimer = 0,
    topCreaturesDivider = 4,
    evolver = 0,
    survivalWeight = 0.4,
    foodWeight = 0.3,
    energyWeight = 0.3,
    selectedSorter = "fitness",
    generations = [],
    detectPoison = false,
    sorters = [
      {
        key: "fitness",
        label: "fit",
      },
      { key: "energy", label: "en" },
      { key: "mass", label: "mass" },
      { key: "maxSpeedIndex", label: "max.S.i" },
    ];
  Circular.setup({
    canvas: $store.canvas.canvas,
    ctx: $store.canvas.ctx,
  });
  const start = () => {
    Circular.setup({
      canvas: $store.canvas.canvas,
      ctx: $store.canvas.ctx,
    });
    // ({ evolver } = Circular.getData());
    Circular.start();
  };
  setInterval(() => {
    ({
      frames,
      evolutionTimer,
      creatures,
      evolver,
      topCreaturesDivider,
      generations,
      detectPoison,
    } = Circular.getData());
    ({ survivalWeight, foodWeight, energyWeight } = getConfig());
  }, 100);
</script>

<div class="grid-cols-2 gap-sm padding-xs">
  <button class="f-sm rounded-sm" on:click={start}>start simulation</button>
  <button class="f-sm rounded-sm" on:click={Circular.stop}
    >stop simulation</button
  >
  <!-- <button class="f-sm rounded-sm" on:click={Circular.addCreature}
    >add creature</button
  > -->
  <!-- <button class="f-sm rounded-sm" on:click={Circular.runMutations}
    >run mutations</button
  > -->
</div>
<div class="grid-cols-4 gap-sm padding-xs">
  {#each sorters as sorter}
    <button
      class="f-sm rounded-sm bg"
      style={selectedSorter === sorter.key
        ? "--bg: hsla(213, 100%, 50%, 1)"
        : "--bg: hsla(213, 25%, 50%, 1)"}
      on:click={() => (selectedSorter = sorter.key)}>{sorter.label}</button
    >
  {/each}
</div>
<button
  class="f-sm rounded-sm bg"
  style="--bg: hsla(213, 25%, 50%, 1)"
  on:click={() => Circular.setup({ detectPoison: !detectPoison })}
>
  detect poison {detectPoison ? "on" : "off"}
</button>
<div class="flex flex-column gap-sm">
  {#each generations as generation, index}
    {#if index === generations.length - 1}
      <div class="flex space-between padding-xs">
        <span>generation: {generation.generation}</span>
        <span>size: {generation.size}</span>
      </div>
    {/if}
  {/each}
</div>
<div class="grid-cols-2 gap-sm padding-xs">
  <label for="evolutionTimer"
    >evolutionTimer<input
      type="number"
      step="10"
      min="50"
      max="2000"
      bind:value={evolutionTimer}
      on:input={() => Circular.setup({ evolutionTimer: evolutionTimer })}
    /></label
  >
  <label for="evolver"
    >evolver<input
      type="number"
      step="0.01"
      min="0.01"
      max="1"
      bind:value={evolver}
      on:input={() => Circular.setup({ evolver: evolver })}
    /></label
  >
  <label for="topCreaturesDivider"
    >topCreaturesDivider<input
      type="number"
      step="0.01"
      min="0.01"
      max="1"
      bind:value={topCreaturesDivider}
      on:input={() =>
        Circular.setup({ topCreaturesDivider: topCreaturesDivider })}
    /></label
  >
  <label for="survivalWeight"
    >survivalWeight
    <input
      type="number"
      step="0.01"
      min="0.01"
      max="1"
      id="survivalWeight"
      bind:value={survivalWeight}
      on:input={() => weightSetup({ survivalWeight: survivalWeight })}
    /></label
  >
  <label for="foodWeight"
    >foodWeight
    <input
      type="number"
      step="0.01"
      min="0.01"
      max="1"
      id="foodWeight"
      bind:value={foodWeight}
      on:input={() => weightSetup({ foodWeight: foodWeight })}
    /></label
  >
  <label for="energyWeight"
    >energyWeight
    <input
      type="number"
      step="0.01"
      min="0.01"
      max="1"
      id="energyWeight"
      bind:value={energyWeight}
      on:input={() => weightSetup({ energyWeight: energyWeight })}
    /></label
  >
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
  {#each creatures.sort((a, b) => b[selectedSorter] - a[selectedSorter]) as creature}
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
        <div class="flex gap-sm padding-xs">
          <span>SR:</span>
          {creature.smellRadius.toFixed(2)}
        </div>
        <div class="flex gap-sm padding-xs">
          <span>MSI:</span>
          {creature.maxSpeedIndex}
        </div>
        <div class="flex gap-sm padding-xs">
          <span>Dead:</span>
          {creature.dead}
        </div>
      </div>
    </div>
  {/each}
{/if}
