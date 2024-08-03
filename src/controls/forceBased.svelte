<script>
  import NumberInput from "../components/NumberInput.svelte";
  import { store } from "../lib/appStore";
  import { ForceBased } from "../lib/projects/forceBased/ForceBased";
  import { ForceBasedWorker } from "../lib/workers/ForceBasedWorker.js";
  let project = "forceBased",
    colorRuleMap = [],
    showColorMap = {};

  const addColor = (e) => {
      let controlIndex = $store.projects[project].controls.findIndex(
          (control) => control.id === e.target.id
        ),
        control = $store.projects[project].controls.find(
          (control) => control.id === e.target.id
        ),
        selectOptions = control.options,
        selectedColor = selectOptions.find(
          (option) => option.value === e.target.value
        ),
        particles = ForceBased.addColor(selectedColor);
      ForceBased.addSelectedColor(selectedColor);
      let particleMap = ForceBased.addToParticleMap(
          selectedColor.label,
          particles
        ),
        newColorRuleMap = ForceBased.addToColorRuleMap(selectedColor);
      ForceBasedWorker.postMessage({
        message: "addColor",
        particles,
        colorRuleMap: newColorRuleMap,
        particleMap,
      });
      // $store.projects[project].controls[controlIndex].options.filter(
      //   (option) => {
      //     return option.value !== e.target.value;
      //   }
      // );
      $store.projects[project].controls[controlIndex].value = "";
      colorRuleMap = ForceBased.getData().colorRuleMap;

      // console.log(ForceBased.getData().particles);
    },
    rangeInput = (control) => {
      ForceBasedWorker.postMessage({
        message: control.id,
        [control.id]: control.value,
      });
      ForceBased.setup({ [control.id]: control.value });
    },
    toggleValue = (control) => {
      let controlIndex = $store.projects[project].controls.findIndex(
        (controlInput) => controlInput.id === control.id
      );
      $store.projects[project].controls[controlIndex].value =
        !$store.projects[project].controls[controlIndex].value;
      ForceBased.setup({
        [$store.projects[project].controls[controlIndex].id]:
          $store.projects[project].controls[controlIndex].value,
      });
      ForceBasedWorker.postMessage({
        message: $store.projects[project].controls[controlIndex].id,
        [$store.projects[project].controls[controlIndex].id]:
          $store.projects[project].controls[controlIndex].value,
      });
    },
    toggleShowColors = (color1Name) => {
      if (showColorMap[color1Name]) {
        showColorMap[color1Name] = !showColorMap[color1Name];
      } else {
        showColorMap[color1Name] = true;
      }
    },
    randomize = (color) => {
      let newColorRuleMap = ForceBased.randomizeDirection(color);
      ForceBasedWorker.postMessage({
        message: "randomize",
        colorRuleMap: newColorRuleMap,
      });
      colorRuleMap = newColorRuleMap;
      // console.log(colorRuleMap);
    },
    adjustDirection = (index, value) => {
      ForceBasedWorker.postMessage({
        message: "adjustDirection",
        index,
        direction: value,
      });
    },
    offscreen = new OffscreenCanvas(
      $store.canvas.canvas.width,
      $store.canvas.canvas.height
    );
  ForceBased.setup({
    canvas: $store.canvas.canvas,
  });
  ForceBasedWorker.postMessage(
    {
      message: "load",
      offscreen,
      ...ForceBased.getData(),
    },
    [offscreen]
  );
  ForceBasedWorker.addEventListener("message", (e) => {
    const bitmap = e.data;
    ForceBased.drawBitmap($store.canvas.ctx, bitmap);
  });
  // $: colorRuleMap = ForceBased.getData().colorRuleMap;
</script>

{#each $store.projects[project].controls as control}
  <div class="flex flex-column padding-y-sm gap-sm">
    <div class="flex space-between">
      <label for={control.id}>{control.label}</label>
      <span>{control.value}</span>
    </div>
    {#if control.inputType === "select"}
      <select id={control.id} bind:value={control.value} on:change={addColor}>
        {#each control.options.filter((option) => {
          if (!ForceBased.getSelectedColors()
              .map((color) => color.value)
              .includes(option.value)) {
            return option;
          }
        }) as option}
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
        on:input={() => rangeInput(control)}
      />
    {/if}
    {#if control.inputType === "button"}
      <button class="f-sm rounded-sm" on:click={() => toggleValue(control)}
        >{control.label}</button
      >
    {/if}
  </div>
{/each}
{#if colorRuleMap && colorRuleMap.length > 0}
  <div class="border f-sm rounded">
    <div class="flex space-between border-bottom align-center padding-sm">
      <div>Color Rule Map</div>
      <button class="f-sm rounded-sm" on:click={() => randomize("all")}>
        <!-- <span class="flex align-center gap-xs"> -->
        <!-- <span>randomize all</span> -->
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
        <!-- </span> -->
      </button>
    </div>
    {#each [...new Set(colorRuleMap.map((rule) => rule.color1))] as color1Name}
      <div>
        <div class="flex space-between align-center padding-sm border-bottom">
          <div class="flex gap-sm align-center">
            <span class="h-10 square bg rounded-xs" style="--bg: {color1Name}"
            ></span>
            <span
              >{color1Name} - {ForceBased.getData().particles.filter(
                ({ c }) =>
                  c ===
                  colorRuleMap.find(({ color1 }) => color1 === color1Name).hex1
              ).length}</span
            >
          </div>
          <div class="flex gap-sm align-center">
            <button
              class="f-sm rounded-sm"
              on:click={() => randomize(color1Name)}
            >
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
            <button
              class="f-lg rounded-sm"
              on:click={() => toggleShowColors(color1Name)}
            >
              <span class="lh0 f-lg flex align-center">
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  width="1em"
                  height="1em"
                  viewBox="0 0 24 24"
                  ><path
                    fill="currentColor"
                    d="M4.22 8.47a.75.75 0 0 1 1.06 0L12 15.19l6.72-6.72a.75.75 0 1 1 1.06 1.06l-7.25 7.25a.75.75 0 0 1-1.06 0L4.22 9.53a.75.75 0 0 1 0-1.06"
                  /></svg
                >
              </span>
            </button>
          </div>
        </div>
        {#if showColorMap[color1Name]}
          <div class="">
            {#each colorRuleMap as { color1, color2, hex1, hex2, direction }, index}
              {#if color1 === color1Name}
                <div
                  class="flex space-between align-center padding-sm border-bottom"
                >
                  <span class="flex gap-sm align-center">
                    <span class="h-10 square bg rounded-xs" style="--bg: {hex2}"
                    ></span>
                    <span>{color2}</span>
                  </span>
                  <NumberInput
                    bind:value={direction}
                    step={0.015625}
                    min={-2}
                    max={2}
                    on:onInput={({ detail }) => {
                      adjustDirection(index, detail);
                    }}
                  ></NumberInput>
                </div>
              {/if}
            {/each}
          </div>
        {/if}
      </div>
    {/each}
  </div>
{/if}
