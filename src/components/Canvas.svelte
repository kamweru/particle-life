<script>
  import { onMount } from "svelte";
  import { store } from "../lib/appStore";
  import { ForceBased } from "../lib/projects/forceBased/ForceBased";
  import { ParticleSimulation } from "../lib/projects/particleSimulation/ParticleSimulation";
  import { FoodPoison } from "../lib/projects/foodvsPoison/FoodPoison";
  import { range } from "../lib/utils";
  let canvas,
    ctx,
    projects = {
      forceBased: ForceBased,
      particleSimulation: ParticleSimulation,
      foodvsPoison: FoodPoison,
    };
  $: if ($store.activeMenu && canvas && !$store.canvas.isSet) {
    ctx = canvas.getContext("2d");
    // $store.canvas.canvas = null;
    // $store.canvas.ctx = null;
    $store.canvas.canvas = canvas;
    $store.canvas.ctx = ctx;
    $store.canvas.isSet = true;
    // projects[$store.activeMenu](ctx);
    // console.log("projects[$store.activeMenu](ctx)");
  }
  // onMount(() => {
  //   ctx = canvas.getContext("2d");
  //   $store.canvas.canvas = canvas;
  //   $store.canvas.ctx = ctx;
  // });
</script>

<!-- <div class="flex">
  {#each [...range(0, 360, 4)] as i}
    <span
      class="h-40 w-40 bg flex flex-wrap items-center justify-center"
      style="--bg: hsl({i}, 100%, 50%)"
    >
      {i}
    </span>
  {/each}
</div> -->

<canvas
  bind:this={canvas}
  height="1080"
  width="1920"
  class="abs scale transform-origin rounded-lg"
  style="--scale: 0.6125"
></canvas>
