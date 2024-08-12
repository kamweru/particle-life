<script>
  import { store } from "../lib/appStore";
  import { Environment } from "../lib/projects/foodvsPoison/FoodPoison";

  let rAF,
    { ctx, canvas } = $store.canvas,
    projectSetup = {
      ENERGY_MULTIPLIER: 10,
      SMELL_RANGE_MULTIPLIER: 200,
      MAX_SPEED_MULTIPLIER: 0.05,
      MAX_FORCE_MULTIPLIER: 5,
      ENERGY_DIVIDER: 10,
      POPULATION: 20,
      FOOD: 20,
      POISON: 20,
      MIN_MASS: 1.5,
      MAX_MASS: 4.5,
      FOOD_MIN_ENERGY: 60,
      FOOD_MAX_ENERGY: 120,
      POISON_MIN_DAMAGE: 60,
      POISON_MAX_DAMAGE: 120,
      CROSSOVER_RATE: 0.918,
      MUTATION_RATE: 0.001,
      AVOIDANCE_MULTIPLIER: 10,
    };
  Environment.setup(projectSetup);
  Environment.init(canvas);
  Environment.step();
</script>
