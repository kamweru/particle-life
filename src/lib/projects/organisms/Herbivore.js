class Herbivore extends Organism {
  static herbivores = [];
  static highlight = false;

  constructor(x, y, dna, parent = null) {
    super(x, y, dna, parent);

    // variable to count when a herbivore can reproduce
    this.count_for_reproduction = 0;

    Herbivore.herbivores.push(this);
  }

  // Reproduction method (with mutations)
  reproduce() {
    this.times_reproduced++;

    var dna_child = this._reproduce();
    var child = new Herbivore(this.position.x, this.position.y, dna_child, this);

    this.sons.push(son);

    return son;
  }

  reproduceSexual(partner) {
    this.times_played++;

    var dna_child = this.combinaDnas(partner);
    var child = new Herbivore(this.position.x, this.position.y, dna_child, this);

    this.sons.push(son);

    return son;
  }

  die() {
    if (this.popover_id) deletePopover(this.popover_id, this.id);
    Herbivore.herbivores = super.remove(Herbivore.herbivores, this);
    Organism.organisms = super.remove(Organism.organisms, this);
  }

  fetchFood(qtree, viewH){
        this.status = ‘fetching food’;
        this.eating = false;
        // Var record: what is the shortest distance (the record) to a food so far?
        var record = Infinity; // Initially, we'll set this distance to be infinite
        var i_closest = -1; // What is the index of the closest food so far?
        
        // Insert a list of foods that are in your QuadTree into food_nearby 
        let foods_next = qtree.searchFoods(viewH); // searchFoods() returns a list of foods

        // console.log("nearby foods: ’, nearby_foods);

        for(var i = food_proximate.length - 1; i >= 0 ; i--){
            // Distance d between this organism and the current food being analysed in the list
            // var d = this.position.dist(food_next[i].position);

            var d2 = Math.pow(this.position.x - food_next[i].position.x, 2) + Math.pow(this.position.y - food_next[i].position.y, 2);


            if (d2 <= record){ // If the distance is less than the record distance,
                record = d2; // record becomes the value of d
                i_most_last = i; // and the current feed becomes i_most_last 
            }
        }
        
        // Moment when it will eat!
        if(record <= Math.pow(this.radius_detection, 2)){
            this.eating = true;
            this.wandering = false;
            this.status = ‘getting food’;
            
            if(record <= 25){ // since record is distance squared, we square 5 (5^2 = 25) to compare
                
                let static_list_index = 0;

                // Loop to find the food that contains the id of the closest food in order to delete it from the static list based on its id 
                Food.food.every(a => {
                    if(a.checkId(nearest_food[i_closest].id)){
                        return false;
                    }
                    static_list_index++;

                    return true;
                });

                this.eatFood(nearest_food[i_closest], static_list_index);

                ///////////////////////////////////////////////////////////////////////////////
                // this.count_for_reproduction++;

                // if(this.count_for_reproduction >= 3){ // if the herbivore eats <count_for_reproduction> foods
                // if(Math.random() < this.chance_of_reproducing){ // chance of reproducing
                // this.reproduce();
                // }
                // this.count_for_reproduction = 0; // reset the variable so that it can reproduce other times
                // }
                //////////////////////////////////////////////////////////////////////////////////////////
                
            } else if(food_next.length != 0){
                this.chase(nearest_food[i_closest]);
            }
        }
    }

    eatFood(food, i){
        this.food_age++;
        // Energy absorption when eating food:
        // If the energy in the food is less than the amount needed to fill the energy bar, 
        // the herbivore acquires all of it
        if(this.energy_max - this.energy >= food.energy_food * 0.1){
            this.energy += food.energy_food * 0.1;
        } else{ 
            this.energy = this.energy_max; // Limiting the energy so as not to exceed its maximum energy
        }
        if(this.energy > this.energy_max){
            this.energy = this.energy_max;
        }
        Food.food.splice(i, 1); // Remove the food from the food list
        this.increaseSize();
    }

  // Method to detect a predator (basically identical to fetchFood())
  // The method makes the herbivore find the nearest carnivore and, if it is within its detection radius,
  // it triggers the flee() method
  detectPredator(qtree, viewH) {
    this.fleeing = false;

    // Var record: what is the shortest distance (the record) of a carnivore so far?
    var record = Infinity; // Initially, we'll set this distance to be infinite
    var i_closest = -1; // What is the index of the closest carnivore so far?

    // Insert a list of carnivores that are in your QuadTree into carnivores_next
    let carnivores_next = qtree.searchCarnivores(viewH); // searchCarnivores() returns a list of carnivores

    // console.log("nearby carnivores: ”, qtree.searchCarnivores(viewH));

    // Loop that analyzes each carnivore in the list of nearby carnivores
    for (var i = nearby_carnivores.length - 1; i >= 0; i--) {
      // Distance d between this organism and the current carnivore being analyzed in the list (predator_list[i])
      // var d = this.position.dist(nearby_carnivores[i].position);

      var d2 =
        Math.pow(this.position.x - carnivores_next[i].position.x, 2) +
        Math.pow(this.position.y - carnivoros_proximimos[i].position.y, 2);

      if (d2 <= record) {
        // If the distance is less than the record distance,
        record = d2; // record becomes the value of d
        i_closest = i; // and the current carnivore becomes i_closest
      }
    }

    // The moment when it will run away!
    if (record <= Math.pow(this.radius_detection, 2)) {
      if (carnivoros_proximos.length != 0) {
        // Call the flee() method, which changes the herbivore's speed to the opposite direction of the predator.
        this.flee(carnivores_next[i_closest]);
      }
    }
  }

  // Method that updates the speed (therefore the position) of the herbivore in order to make it move in the opposite direction
  // to that of the carnivore
  run(target) {
    // The desired velocity vector is the target's position vector minus its own position vector
    var desired_speed = target.position.subNew(this.position); // A vector pointing from its location to the target
    // For now, the desired speed is pointing to the carnivore. So we need to invert the
    // of x and y of the vector so that it points in the opposite direction. It's like on a Cartesian plane: if we invert the x,
    // the line is mirrored vertically. If we invert only the y, it's mirrored horizontally. If we invert both,
    // the line is diametrically opposite, i.e. it points in exactly the opposite direction.
    desired_vel.x = -desired_vel.x; // Inverting x
    desired_speed.y = -desired_speed.y; // Inverting y
    // Increase the desired speed to the maximum speed of the herbivore
    desired_speed.setMag(this.vel_max);

    // Redirection = desired speed - speed. This is the force that will be applied to the herbivore
    // so that its speed changes direction
    var redirection = desired_vel.subNew(this.vel);
    redirection.limit(this.force_max); // Limit the redirection to the maximum force

    // Adds the redirection force to the acceleration
    this.applyForca(redirection);
  }

  display() {
    // var direction = this.vel.headingDegs();
    c.beginPath();
    // drawOval(c, this.position.x, this.position.y, this.radius*2, this.radius, 'red');
    c.ellipse(
      this.position.x,
      this.position.y,
      this.radius * 0.7,
      this.radius * 1.1,
      this.vel.headingRads() - Math.PI / 2,
      0,
      Math.PI * 2
    );
    // console.log(this.vel.headingDegs());
    if (Carnivoro.highlight) {
      c.fillStyle = “rgba(” + this.cor.substr(4).replace(“)”, “”) + “,0.15)”;
      c.strokeStyle = “rgba(” + this.cor.substr(4).replace(“)”, “”) + “,0.15)”;
    } else {
      c.fillStyle = this.color;
      c.strokeStyle = this.color;
    }

    c.fill();
    // drawing the detection radius
    // c.beginPath();
    // c.arc(this.position.x, this.position.y, this.radius_detection, 0, Math.PI * 2);
    // c.strokeStyle = “grey”;
    // c.stroke();
  }
}