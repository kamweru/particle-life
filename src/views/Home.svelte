<script>
  import Canvas from "../components/Canvas.svelte";
  import Sidebar from "../components/Sidebar.svelte";
  import Topbar from "../components/Topbar.svelte";
</script>

<main class="flex h-full">
  <Sidebar></Sidebar>
  <div class="flex flex-column flex-1 h-full">
    <Topbar></Topbar>
    <div class="flex-1 flex align-center justify-center">
      <Canvas></Canvas>
    </div>
  </div>
</main>
