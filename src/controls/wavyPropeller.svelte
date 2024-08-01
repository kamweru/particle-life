<script>
  import { store } from "../lib/appStore";
  import { WavyPropeller } from "../lib/projects/wavyPropeller/WavyPropeller";

  WavyPropeller.setup({
    ctx: $store.canvas.ctx,
    canvas: $store.canvas.canvas,
  });
  WavyPropeller.draw();
</script>
