<script>
  import { store } from "../lib/appStore";
</script>

<div class="border-bottom flex align-center">
  <div class="flex flex-gap-xs align-center h-full padding-sm">
    <div>Projects</div>
    {#each $store.menu as menu}
      <button
        class="rounded-sm {$store.activeMenu === menu.key ? 'bg-indigo' : ''}"
        on:click={() => ($store.activeMenu = menu.key)}>{menu.title}</button
      >
    {/each}
  </div>
</div>
