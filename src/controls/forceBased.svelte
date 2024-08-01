<script>
  import { store } from "../lib/appStore";
  import { ForceBased } from "../lib/projects/forceBased/ForceBased";
  import { getRandomFloat, getRandomFromRange } from "../lib/utils";
  import { ForceBasedWorker } from "../lib/workers/ForceBasedWorker.js";
  let project = "forceBased";

  const addColor = (e) => {
      let colorRuleMap = [],
        selectOptions = $store.projects[project].controls.find(
          (control) => control.id === e.target.id
        ).options,
        selectedColor = selectOptions.find(
          (option) => option.value === e.target.value
        ),
        group = ForceBased.createParticles(
          getRandomFromRange(
            $store.projects[project].minParticles,
            $store.projects[project].maxParticles
          ),
          getRandomFromRange(0, 360),
          $store.canvas.canvas.width,
          $store.canvas.canvas.height
        );

      console.log(group);
      $store.projects[project].selectedColors.push(selectedColor);
      colorRuleMap.push({
        color1: selectedColor.label,
        color2: selectedColor.label,
        hex1: selectedColor.value,
        hex2: selectedColor.value,
        direction: getRandomFloat(),
      });
      $store.projects[project].selectedColors.map(({ label, value }) => {
        if (label !== selectedColor.label) {
          colorRuleMap = [
            ...colorRuleMap,
            {
              color1: label,
              color2: selectedColor.label,
              hex1: value,
              hex2: selectedColor.value,
              direction: getRandomFloat(),
            },
            {
              color1: selectedColor.label,
              color2: label,
              hex1: selectedColor.value,
              hex2: value,
              direction: getRandomFloat(),
            },
          ];
        }
      });
      $store.projects[project].colorRuleMap = [
        ...$store.projects[project].colorRuleMap,
        ...colorRuleMap,
      ];
      $store.projects[project].particles = [
        ...$store.projects[project].particles,
        ...group,
      ];
      ForceBasedWorker.postMessage({
        message: "addColor",
        particles: group,
        colorRuleMap,
        particleMap: { [selectedColor.label]: group },
      });
      ForceBasedWorker.postMessage({
        message: "start",
      });
      // createParticleMap();
      // createColorRuleMap();
    },
    createParticleMap = () => {
      let particleMap = {},
        group = [];
      $store.projects[project].selectedColors.map(({ label, value }) => {
        let particles = ForceBased.createParticles(
          getRandomFromRange(
            $store.projects[project].minParticles,
            $store.projects[project].maxParticles
          ),
          getRandomFromRange(0, 360),
          $store.canvas.canvas.width,
          $store.canvas.canvas.height
        );
        group = [...group, ...particles];
        particleMap[label] = particles;
      });
      $store.projects[project].particles = [
        ...$store.projects[project].particles,
        ...group,
      ];
      $store.projects[project].particleMap = {
        ...$store.projects[project].particleMap,
        ...particleMap,
      };
      console.log("particleMap", particleMap);
    },
    createColorRuleMap = () => {
      let colorRuleMap = [];
      $store.projects[project].selectedColors.flatMap((color1) => {
        $store.projects[project].selectedColors.map((color2) => {
          colorRuleMap.push({
            color1: color1.label,
            color2: color2.label,
            hex1: color1.value,
            hex2: color2.value,
            direction: getRandomFloat(),
          });
        });
      });
      $store.projects[project].colorRuleMap = {
        ...$store.projects[project].colorRuleMap,
        ...colorRuleMap,
      };
      console.log("colorRuleMap", colorRuleMap);
    },
    offscreen = new OffscreenCanvas(
      $store.canvas.canvas.width,
      $store.canvas.canvas.height
    );
  // createColorRuleMap();
  // createColorRuleMap();
  ForceBasedWorker.postMessage(
    {
      message: "load",
      offscreen,
      particleMap: $store.projects[project].particleMap,
      colorRuleMap: $store.projects[project].colorRuleMap,
      particles: $store.projects[project].particles,
      timeFactor: $store.projects[project].timeFactor,
      canvasWidth: $store.canvas.canvas.width,
      canvasHeight: $store.canvas.canvas.height,
      // forceFactor: $store.projects[project].forceFactor,
    },
    [offscreen]
  );
  ForceBasedWorker.addEventListener("message", (e) => {
    const bitmap = e.data;
    ForceBased.drawBitmap($store.canvas.ctx, bitmap);
  });
</script>

{#each $store.projects[project].controls as control}
  <div class="flex flex-column padding-y-sm gap-sm">
    <div class="flex space-between">
      <label for={control.id}>{control.label}</label>
      <span>{control.value}</span>
    </div>
    {#if control.inputType === "select"}
      <select id={control.id} bind:value={control.value} on:change={addColor}>
        {#each control.options as option}
          <option value={option.value}>{option.label}</option>
        {/each}
      </select>
    {/if}
    {#if control.inputType === "range"}
      <input
        type="range"
        id={control.id}
        min={control.min}
        max={control.max}
        step={control.step}
        bind:value={control.value}
      />
    {/if}
  </div>
{/each}
