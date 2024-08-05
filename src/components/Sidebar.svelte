<script>
  import { store } from "../lib/appStore";
  import { uuid } from "../lib/utils";
  let controls,
    loadedControls = "";
  const startRecording = () => {
      const recorder = new MediaRecorder(
        $store.canvas.canvas.captureStream(),
        $store.recorder.options
      );
      recorder.addEventListener("dataavailable", (e) => {
        $store.recorder.chunks.push(e.data);
      });
      recorder.addEventListener("stop", async () => {
        const blob = new Blob($store.recorder.chunks, $store.recorder.options);
        const url = URL.createObjectURL(blob);
        const a = document.createElement("a");
        a.href = url;
        a.download = `recording-${uuid(6)}.webm`;
        a.click();
      });
      recorder.start();
      $store.recorder.status = recorder.state;
      $store.recorder.mediaRecorder = recorder;
    },
    stopRecording = () => {
      $store.recorder.mediaRecorder.stop();
      $store.recorder.status = $store.recorder.mediaRecorder.state;
      $store.recorder.chunks = [];
      $store.recorder.mediaRecorder = null;
    },
    loadControls = async () => {
      controls = (await import("../controls/" + $store.activeMenu + ".svelte"))
        .default;
      loadedControls = $store.activeMenu;
      // $store.canvas.canvas = null;
      // $store.canvas.ctx = null;
      console.log("load controls");
    };

  $: if ($store.activeMenu && loadedControls !== $store.activeMenu)
    loadControls();
</script>

<div
  class="w-4xs border-right h-full overflow-y scrollbar-xs f-sm"
  style="--overflow: auto;"
>
  <div class="grid-cols-2 gap-sm padding-sm">
    <button class="rounded-sm">start simulation</button>
    <button class="rounded-sm">stop simulation</button>
  </div>
  <div class="grid-cols-2 gap-sm padding-sm">
    {#if $store.recorder.status === "recording"}
      <button class="rounded-sm" on:click={stopRecording}>stop recording</button
      >
    {/if}
    {#if $store.recorder.status === "inactive"}
      <button class="rounded-sm" on:click={startRecording}
        >start recording</button
      >
    {/if}
    <span>{$store.recorder.status}</span>
  </div>

  <div class="padding-sm">
    <svelte:component this={controls} />
  </div>
</div>
