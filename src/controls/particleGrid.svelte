<script>
  import { ParticleGrid } from "../lib/projects/particleGrid/particleGrid";
  import { store } from "../lib/appStore";
  let started = false,
    project = "particleGrid";
  ParticleGrid.setup({
    ctx: $store.canvas.ctx,
    canvas: $store.canvas.canvas,
  });
  const rangeInput = (control) => {
    ParticleGrid.setup({
      [control.id]: control.value,
    });
  };
</script>

<button
  class="f-sm rounded-sm"
  on:click={() => {
    started = !started;
    ParticleGrid.running() ? ParticleGrid.stop() : ParticleGrid.start();
  }}
>
  {ParticleGrid.running() ? "stop" : "start"}
</button>

{#each $store.projects[project].controls as control}
  <div class="flex flex-column padding-y-sm gap-sm">
    <div class="flex space-between">
      <label for={control.id}>{control.label}</label>
      <span>{control.value}</span>
    </div>
    {#if control.inputType === "range"}
      <input
        type="range"
        id={control.id}
        min={control.min}
        max={control.max}
        step={control.step}
        bind:value={control.value}
        on:input={() => rangeInput(control)}
      />
    {/if}
  </div>
{/each}
