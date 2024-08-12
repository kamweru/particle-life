<script>
  import { store } from "../lib/appStore";
  import { getRandomFromRange, getRandomFloat } from "../lib/utils";
  import { ParticleSimulationWorker } from "../lib/workers/ParticleSimulationWorker";
  let rAF,
    { ctx, canvas } = $store.canvas;

  const offscreen = new OffscreenCanvas(canvas.width, canvas.height),
    config = {
      numParticles: 2000,
      dt: 0.02,
      frictionHalfLife: 0.04,
      rMax: 0.1,
      m: getRandomFromRange(10, 15),
      forceFactor: getRandomFromRange(1, 10),
      partitionSize: getRandomFromRange(10, 20),
    },
    controls = [
      {
        label: "numParticles",
        key: "numParticles",
        min: 100,
        max: 5000,
        step: 100,
      },
      {
        label: "m",
        key: "m",
        min: 1,
        max: 100,
        step: 1,
      },
      {
        label: "partitionSize",
        key: "partitionSize",
        min: 1,
        max: 100,
        step: 1,
      },
      {
        label: "frictionHalfLife",
        key: "frictionHalfLife",
        min: -0.5,
        max: 0.5,
        step: 0.00390625,
      },
      {
        label: "dt",
        key: "dt",
        min: -0.5,
        max: 0.5,
        step: 0.00390625,
      },
      {
        label: "rMax",
        key: "rMax",
        min: -0.5,
        max: 0.5,
        step: 0.00390625,
      },
      {
        label: "forceFactor",
        key: "forceFactor",
        min: -10,
        max: 10,
        step: 0.125,
      },
    ],
    start = () => ParticleSimulationWorker.postMessage({ message: "start" }),
    updateConfig = () => {
      ParticleSimulationWorker.postMessage({
        message: "updateConfig",
        config,
      });
    };
  ParticleSimulationWorker.postMessage(
    {
      message: "init",
      offscreen,
    },
    [offscreen]
  );
  ParticleSimulationWorker.postMessage({
    message: "configSetup",
    config,
  });
  ParticleSimulationWorker.onmessage = (event) => {
    const { bitmap } = event.data;
    ctx.drawImage(bitmap, 0, 0);
  };
</script>

<button class="f-sm rounded-sm" on:click={start}>Start Simulation</button>
{#each controls as { label, key, min, max, step }}
  <label class="flex flex-column padding-sm gap-sm">
    <span> {label}</span>
    <input
      type="number"
      {min}
      {max}
      {step}
      bind:value={config[key]}
      on:input={updateConfig}
    />
  </label>
{/each}
