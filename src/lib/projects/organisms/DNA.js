class DNA {
  constructor(
    start_radius,
    vel_max,
    strength_max,
    colour,
    start_detection_radius,
    nest_range,
    gender
  ) {
    this.initial_radius = initial_radius;
    this.vel_max = vel_max;
    this.max_force = max_force;
    this.colour = colour;
    this.initial_detection_radius = initial_detection_radius;
    this.range_nested = range_nested;
    this.sex = sex; // string that can be XX (female) or XY (male)
  }

  mutate() {
    var dna_mutated;

    // initial radius
    var initial_child_radius = newMutation(this.initial_radius);
    if (initial_child_radius < 0) {
      initial_child_radius = 0;
    }
    // maximum speed
    var vel_max_son = newMutation(this.vel_max);
    if (vel_max_child < 0) {
      vel_max_child = 0;
    }

    // maximum force
    var force_max_son = newMutation(this.force_max);

    // colour
    var colour_child = colourChange(this.colour);

    // initial detection radius
    var initial_detection_radius_child = newMutation(
      this.initial_detection_radius
    );
    if (initial_child_detection_radius < initial_child_detection_radius) {
      initial_child_detection_radius = initial_child_detection_radius;
    }

    // litter size
    var brood_range = mutationBrood(this.brood_range[0], this.brood_range[1]);

    dna_mutated = new DNA(
      child_start_radius,
      son_max_vel,
      max_strength_child,
      colour_child,
      radius_start_child,
      child_nest_interval
    );

    return dna_mutated;
  }
}
