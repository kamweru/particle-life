<script>
  import { createEventDispatcher } from "svelte";
  import { uuid, longpress } from "../lib/utils";
  export let value = 0,
    step = 1,
    min = 0,
    max = 100,
    id = uuid(8);
  const dispatch = createEventDispatcher(),
    increment = () => {
      if (value < max) value += step;
      dispatch("onInput", value);
    },
    decrement = () => {
      if (value > min) value -= step;
      dispatch("onInput", value);
    };
</script>

<div class="flex gap-xs align-center">
  <button
    class="f-sm rounded-sm"
    use:longpress={{ interval: 100, cb: decrement }}
  >
    <span class="lh0 flex align-center f-lg">
      <svg
        xmlns="http://www.w3.org/2000/svg"
        width="1em"
        height="1em"
        viewBox="0 0 24 24"
        ><path
          fill="none"
          stroke="currentColor"
          stroke-linecap="round"
          stroke-linejoin="round"
          stroke-width="2"
          d="M5 12h14"
        /></svg
      >
    </span>
  </button>
  <input
    type="text"
    class="w-40 h-20 f-sm"
    {id}
    bind:value
    on:input={() => dispatch("onInput", value)}
  />
  <button
    class="f-sm rounded-sm"
    use:longpress={{ interval: 100, cb: increment }}
  >
    <span class="lh0 flex align-center f-lg"
      ><svg
        xmlns="http://www.w3.org/2000/svg"
        width="1em"
        height="1em"
        viewBox="0 0 24 24"
        ><path
          fill="none"
          stroke="currentColor"
          stroke-linecap="round"
          stroke-linejoin="round"
          stroke-width="2"
          d="M12 5v14m-7-7h14"
        /></svg
      >
    </span>
  </button>
</div>
