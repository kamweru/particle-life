<script>
  import { store } from "../lib/appStore";
  const menuClick = (key) => {
    $store.activeMenu = key;
    $store.canvas.isSet = false;
    $store.canvas = {};
  };
</script>

<div class="border-bottom flex align-center">
  <div class="flex flex-gap-xs align-center h-full padding-sm">
    <div>Projects</div>
    {#each $store.menu as menu}
      <button
        class="rounded-sm {$store.activeMenu === menu.key ? 'bg-indigo' : ''}"
        on:click={() => menuClick(menu.key)}>{menu.title}</button
      >
    {/each}
  </div>
</div>
