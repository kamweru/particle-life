<script>
  import { store } from "../lib/appStore";
  import { ParticleGridWorker } from "../lib/workers/ParticleGridWorker.js";
  let started = false,
    forces = {},
    selectedColors = [],
    project = "particleGrid";
  const rangeInput = (control) => {
      ParticleGridWorker.postMessage({
        message: "setup",
        config: {
          [control.id]: control.value,
        },
      });
    },
    addColor = (control) => {
      let selectedColor = control.options.find(
        (option) => option.value === control.value
      );
      ParticleGridWorker.postMessage({
        message: "addColor",
        color: selectedColor,
      });
      selectedColors.push(selectedColor);
      document.querySelector(`#${control.id}`).value = "";
    },
    randomize = (key) => {
      if (key === "all") {
        ParticleGridWorker.postMessage({
          message: "randomizeAll",
        });
      } else {
        ParticleGridWorker.postMessage({
          message: "randomize",
          key: key,
        });
      }
    },
    startSimulation = () => {
      ParticleGridWorker.postMessage({
        message: "start",
      });
    };
  const offscreen = new OffscreenCanvas(
    $store.canvas.canvas.width,
    $store.canvas.canvas.height
  );
  ParticleGridWorker.postMessage(
    {
      message: "setup",
      config: {
        offscreen,
      },
    },
    [offscreen]
  );
  ParticleGridWorker.addEventListener("message", (event) => {
    const { bitmap } = event.data;
    ({ forces } = event.data);
    $store.canvas.ctx.drawImage(bitmap, 0, 0);
  });
</script>

<button
  class="f-sm rounded-sm"
  on:click={() => {
    started = !started;
    startSimulation();
  }}
>
  start simulation
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
    {#if control.inputType === "select"}
      <select
        id={control.id}
        bind:value={control.value}
        on:change={() => addColor(control)}
      >
        {#each control.options.filter((option) => {
          if (!selectedColors
              .map((color) => color.value)
              .includes(option.value)) {
            return option;
          }
        }) as option}
          <option value={option.value}>{option.label}</option>
        {/each}
      </select>
    {/if}
  </div>
{/each}
{#if Object.keys(forces).length > 0}
  <div class="flex">
    <button class="f-sm rounded-sm" on:click={() => randomize("all")}>
      <span class="lh0 f-lg flex align-center">
        <svg
          xmlns="http://www.w3.org/2000/svg"
          width="1em"
          height="1em"
          viewBox="0 0 24 24"
          ><path
            fill="currentColor"
            fill-rule="evenodd"
            d="M4 17a1 1 0 0 1 0-2h2l3-3l-3-3H4a1.001 1.001 0 0 1 0-2h3l4 4l4-4h2V5l4 3.001L17 11V9h-1l-3 3l3 3h1v-2l4 3l-4 3v-2h-2l-4-4l-4 4z"
          /></svg
        >
      </span>
    </button>
  </div>
  {#each Object.keys(forces) as key}
    <div class="border">
      <div class="flex space-between align-center padding-xs">
        <div class="flex gap-sm align-center">
          <span class="h-10 square bg rounded-xs" style="--bg: {key}"></span>
          <div class="f-sm">{key}</div>
        </div>
        <button class="f-sm rounded-sm" on:click={() => randomize(key)}>
          <span class="lh0 f-lg flex align-center">
            <svg
              xmlns="http://www.w3.org/2000/svg"
              width="1em"
              height="1em"
              viewBox="0 0 24 24"
              ><path
                fill="currentColor"
                fill-rule="evenodd"
                d="M4 17a1 1 0 0 1 0-2h2l3-3l-3-3H4a1.001 1.001 0 0 1 0-2h3l4 4l4-4h2V5l4 3.001L17 11V9h-1l-3 3l3 3h1v-2l4 3l-4 3v-2h-2l-4-4l-4 4z"
              /></svg
            >
          </span>
        </button>
      </div>
      {#each Object.keys(forces[key]) as force}
        <div class="flex space-between align-center padding-xs">
          <span> {force}</span>
          <span> {forces[key][force]}</span>
        </div>
      {/each}
    </div>
  {/each}
{/if}
