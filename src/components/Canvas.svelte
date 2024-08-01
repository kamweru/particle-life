<script>
  import { onMount } from "svelte";
  import { store } from "../lib/appStore";
  import { ForceBased } from "../lib/projects/forceBased/ForceBased";
  import { ParticleSimulation } from "../lib/projects/particleSimulation/ParticleSimulation";
  import { FoodPoison } from "../lib/projects/foodvsPoison/FoodPoison";
  let canvas,
    ctx,
    projects = {
      forceBased: ForceBased,
      particleSimulation: ParticleSimulation,
      foodvsPoison: FoodPoison,
    };
  // $: if ($store.activeMenu && canvas) {
  //   projects[$store.activeMenu](ctx);
  //   console.log("projects[$store.activeMenu](ctx)");
  // }
  onMount(() => {
    ctx = canvas.getContext("2d");
    $store.canvas.canvas = canvas;
    $store.canvas.ctx = ctx;
  });
</script>

<canvas
  bind:this={canvas}
  height="1080"
  width="1920"
  class="abs scale transform-origin rounded-lg"
  style="--scale: 0.6125"
></canvas>
