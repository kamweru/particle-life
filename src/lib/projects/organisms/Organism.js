class Organism{
    static organisms = [];
    static n_total_organisms = 0;
    static id = 0;

    constructor(x, y, dna, parent = null){
        this.id = Organism.id++;        
        this.position = new Vector(x, y);
        if(parent){
            this.parent = parent;
        }
        this.children = [];

        this.initial_radius = dna.initial_radius;
        this.vel_max = dna.vel_max;
        this.forca_max = dna.forca_max;
        this.colour = dna.colour;
        this.initial_detection_radius = dna.initial_detection_radius;
        this.nest_interval = dna.nest_interval;
        this.sex = dna.sex;

        // DNA -> Object to separate only the attributes passed to the descendants
        this.dna = new DNA(
            this.radius_initial,
            this.vel_max,
            this.max_force,
            this.colour,
            this.initial_detection_radius,
            this.nest_interval,
            this.gender
        )

        this.radius = this.initial_radius;
        this.vel = new Vector(0.0001, 0.0001);
        this.acel = new Vector(0, 0);
        var rgb = this.cor.substring(4, this.cor.length - 1).split(‘,’);
        this.cor2 = ‘rgba(’ + Math.floor(parseInt(rgb[0]) * 0.4) + ‘,’ + Math.floor(parseInt(rgb[1]) * 0.4) + ‘,’ + Math.floor(parseInt(rgb[2]) * 0.4) + ‘)’;
        
        this.decay_radius = this.initial_decay_radius;
        this.energy_max = Math.pow(this.radius, 2) * 6;
        this.energia_max_fixa = Math.pow(this.raio_inicial * 1.5, 2) * 6; // Used to obtain non-variable values in the graph


        // NINES

        // this.energy = this.energy_max * 0.75
        if(parent){
            this.energy = (this.energy_max * (0.75 + Math.random() / 4)) / (parent.nest_size) * 0.6; // Starts with a portion of the maximum energy
        } else{
            this.energy = this.energy_max * 0.75
        }

        this.energy_expenditure_rate;
        this.minimum_expenditure = 0.0032 * Math.pow(Math.pow(this.radius, 2), 0.75); // Following Kleiber's law for the metabolic rate of living beings
        this.max_energy_expenditure_rate = this.min_expenditure + (Math.pow(this.initial_radius * 1.5, 2) * Math.pow(this.vel_max, 2)) * 0.00012;;
        this.chance_of_reproduction = 0.5;
        this.status;
        this.food_age = 0;
        this.times_reproduced = 0;
        this.second_birth = seconds_totals; // ‘second’ is the global variable
        this.time_lived = parseInt(generateNumberByInterval(200, 300)); // life time of the organism
        this.time_lived = 0;
        this.size_nested;

        // Status variables
        this.eating = false;
        this.running away = false;
        this.wandering = false;

        // Variable that delimits the distance from the edge at which the organisms will start to curve so as not to hit the edges. 
        this.d = 20; 

        // Variables used for the wander() method
        this.d_circle = 2;
        this.radius_circle = 1;
        this.angle_wander = Math.random() * 360;

        // variable to separate the organisms that were born before the screen split from those that were born after.
        this.before_split = false;
        this.fixed_position = new Vector(x, y);

        Organism.organisms.push(this);
        Organism.n_total_organisms++;
    }
  
    // Creating a reproduction method common to all organisms
    _reproduce(){
        return this.dna.mutate();
    }

    // Method for updating the state of the organism
    update(){
        this.time_lived = total_seconds - this.second_born;
        this.energy_expenditure_rate = (Math.pow(this.radius, 2) * Math.pow(this.vel.mag(), 2)) * 0.0002; // Updates according to current speed
        // Rate of energy decrease
        if(this.energy > 0){
            this.energy -= (this.energy_expenditure_rate + this.minimum_expenditure);

            if(Math.random() < (0.0005 * this.age_eaten)/10){ // Low number because it tests every frame. The more you eat, the higher the chances
                if(Math.random() <= this.chance_of_reproducing){
                    // this.reproduce();
                    // LITTLE

                    this.litter_size = generateInteger(this.litter_range[0], this.litter_range[1] + 1);
                    for(var i = 0; i < this.nest_size; i++){
                        if(Math.random() < 0.2){ // To space out the births
                            this.reproduce();
                        }
                    }
                }
            }
        } else{
            this.dies(); 
        }
        
        if(this.time_lived >= this.time_lived){ // if more time has passed since birth than the lifetime of the organism
            this.dies();
        }

        // Border delimitation
        if(screenSplit){
            this.createsBorders(true);
        } else{
            this.createsBorders(false);
        }
    
        // Velocity update (sum velocity vector and acceleration vector)
  this.vel.add(this.acel);
        // Limit speed
        this.vel.limit(this.vel_max);

        // console.log("vel angle: ’, this.vel.headingDegs());

        // If there is a proxy, insert it there so that the change in position can be monitored
        if(this.proxy) {
            this.proxy.add(this.vel)
        } else {
            // Velocity changes position (just as acceleration changes velocity)
            this.position.add(this.vel);
        }
        // Reset acceleration to 0 every cycle
        this.acel.mul(0);

        this.display();
    }

    increaseSize(){
        if(this.radius<(this.initial_radius*1.5)){
            this.radius += 0.05*this.radius;
            this.radius_detection += 0.03*this.radius_detection;
        }
        this.energy_max = Math.pow(this.radius, 2) * 6
    }

    // Method to create borders that will delimit the body's space
    createBorders(screenSplit){ // screenSplit: boolean
        this.delimitsBorders(screenDivided);
        this.avoidBorders(screenDivided);
    }

    // Method to prevent organisms from passing outside the screen
    delimitsBorders(screenDivided){
        if(screenSplit == true){
            // Delimitation for those on the left side
            if(this.position.x <= universeWidth/2){
                if(this.posicao.x + 2*this.raio > universoWidth / 2) // right border (the split, i.e. halfway down the screen)
                    this.vel.x = this.vel.x * -1; // inverts the x speed if it crosses the border

                if(this.position.x < 0) // left edge
                    this.vel.x = this.vel.x * -1;

                if(this.position.y + this.radius > universeHeight) // bottom edge
                    this.vel.y = this.vel.y* -1;

                if(this.position.y < 0) // top edge
                    this.vel.y = this.vel.y * -1;
            } else{ // Delimitation for those on the right side
                if(this.position.x + 2*this.radius > universeWidth) // right edge
                    this.vel.x = this.vel.x * -1; //invert speed x if it goes over the edge of the canvas

                if(this.position.x - this.radius < universeWidth / 2) // left edge (the division, i.e. halfway down the canvas)
                    this.vel.x = this.vel.x * -1;

                if(this.position.y + this.radius > universeHeight) // bottom edge
                    this.vel.y = this.vel.y* -1;

                if(this.position.y < 0) // top edge
                    this.vel.y = this.vel.y * -1;
            }
            
        } else{ // if the screen is NOT split
            if(this.position.x + 2*this.radius > universeWidth) // right edge
                this.vel.x = this.vel.x * -1; //invert speed x if it goes beyond the edge of the canvas

            if(this.position.x - this.radius < 0) // left edge
                this.vel.x = this.vel.x * -1;

            if(this.position.y + this.radius > universeHeight) // bottom edge
                this.vel.y = this.vel.y* -1;

            if(this.position.y < 0) // top edge
                this.vel.y = this.vel.y * -1;
        }
        
    }

    // Method to apply force to the body to prevent it from continuing along a path off the screen
    avoidBorders(screenSplit){
        var desired_vel = null; // This velocity will be the vector that tells the organism where to go so that it doesn't go off the edge
        this.close_to_edge = false;

        if(screenSplit == true){
            // For those on the left
            if(this.position.x <= universeWidth/2){
                // Left edge
                if(this.position.x - this.radius < this.d){ // d is an attribute of every organism that delimits the distance from an edge from which it will start manoeuvring
                    desired_vel = new Vector(this.vel_max, this.vel.y); // Makes its speed maximum in the x direction (to the right)
                    this.close_to_edge = true;
                } 
                // Right edge
                else if(this.position.x + 2*this.radius > universeWidth / 2 - this.d){ // the right edge is half the canvas (in split screen)
                    desired_vel = new Vector(-this.vel_max, this.vel.y); // Make your speed maximum in the -x direction (to the left)
                    this.close_to_edge = true;
                }
                // Top edge
                if(this.position.y - this.radius < this.d){
                    desired_vel = new Vector(this.vel.x, this.vel_max); // Make your speed maximum in the y direction (downwards)
                    this.close_to_edge = true;
                }
                // Bottom edge
                else if(this.position.y + this.radius > universeHeight - this.d){
                    desired_vel = new Vector(this.vel.x, -this.vel_max); // Make your speed maximum in the -y direction (upwards)
                    this.close_to_edge = true;
                }
            }
             // For those on the right
            else{
                // Left border
                if(this.position.x - this.radius < universeWidth/2 + this.d){ // the left edge is half the canvas (in split screen)
                    desired_vel = new Vector(this.vel_max, this.vel.y); // Makes its speed maximum in the x direction (to the right)
                    this.close_to_edge = true;
                } 
                // Right edge
                else if(this.position.x + 2*this.radius > universeWidth - this.d){
                    desired_vel = new Vector(-this.vel_max, this.vel.y); // Make your speed maximum in the -x direction (to the left)
                    this.near_edge = true;
                }
                // Top edge
                if(this.position.y < this.d){
                    desired_vel = new Vector(this.vel.x, this.vel_max); // Make your speed maximum in the y direction (down)
                    this.close_to_edge = true;
                }
                // Bottom edge
                else if(this.position.y > universeHeight - this.d){
                    desired_vel = new Vector(this.vel.x, -this.vel_max); // Make your speed maximum in the -y direction (upwards)
                    this.close_to_edge = true;
                }
            }
            
        } else{ // if the screen is NOT split
             // Left edge
             if(this.position.x - this.radius < this.d){ 
                desired_vel = new Vector(this.vel_max, this.vel.y); // Makes its speed maximum in the x direction (to the right)
                this.near_edge = true;
            } 
            // Right edge
            else if(this.position.x + this.radius > universeWidth - this.d){
                desired_vel = new Vector(-this.vel_max, this.vel.y); // Make your speed maximum in the -x direction (to the left)
                this.near_edge = true;
            }
            // Top edge
            if(this.position.y - this.radius < this.d){
                desired_vel = new Vector(this.vel.x, this.vel_max); // Make your speed maximum in the y direction (downwards)
                this.close_to_edge = true;
            }
            // Bottom edge
            else if(this.position.y + this.radius> universeHeight - this.d){
                desired_vel = new Vector(this.vel.x, -this.vel_max); // Make your speed maximum in the -y direction (upwards)
                this.close_to_edge = true;
            }
        }
        

        if(desired_vel != null){ // If any of the previous conditions have been met
            vel_desejado.normalize(); // Normalises (transforms to size 1) the vector vel_desejado
            desired_vel.mul(this.vel_max); // Multiplies the vector (which now has size 1) by the maximum speed
            var redirection = desired_vel.sub(this.vel); // Creates a force vector that will redirect the body
            redirection.limit(this.force_max * 100); // Limit this force with a larger gap to give it a chance of being greater than the other forces acting on it
            this.applyForca(redirection); // Applies this force to the organism and makes it slightly stronger to prioritise it over other forces
        }
    }


    // Method to apply the force that will make the organism turn towards the nearest target in a natural way
    applyForce(force){
        // Adds the force to the acceleration, which increases it
        // We can take mass into account in the calculation too: A = F / M (not implemented)
        this.acel.add(forca);
    }

    // Test for implementing behaviour learning
    behaviour(good, bad){
        
    }

    // Method that will make the organism wander around when it's not fleeing or chasing
    wander(){
        // if(!this.running away && !this.eating){
            this.wandering = true;
            this.status = ‘wandering’;
            // The idea is to create a small force at each frame just in front of the organism, one d from it.
            // We'll draw a circle in front of the organism, and the displacement force vector will start from the centre
            // of the circle and will have the size of its radius. The larger the circle, the greater the force.
            // In order to know which way the body is facing, we'll use the velocity vector to help us, 
            // since it always points in the direction of the body's movement.

            // CREATING THE CIRCLE
            var centre_circle = new Vector(0, 0); // We've created a vector that will represent the distance of the organism from the centre of the circle
            centre_circle = this.vel.copy(); // This is so that the circle is exactly in front of the organism (as explained a little above)
        centre_circle.normalize(); // We have normalised the vector, i.e. its size is now 1 (and no longer the size of the velocity vector, as it was in the ac line).
        
        
            centre_circle.mul(this.d_circle); // The variable d_circle is a globally defined constant, and stores the value of the distance from the centre of the circle
            
            // CREATING THE DISPLACEMENT FORCE
            var displacement = new Vector(0, -1);
            displacement.mul(this.radius_circle); // The force will have the size of the circle's radius
            // Changing the direction of the force randomly
            displacement.rotateDegs(this.wander_angle); // Rotates the force by wander_angle (variable defined in the constructor)
            // Slightly changing the value of wander_angle so that it changes little by little with each frame
            this.angulo_vagueio += Math.random() * 30 - 15; // Changes to a value between -15 and 15
            
            // CREATING THE WANDERING FORCE
            // The wandering force can be thought of as a vector that leaves the body's position and goes to a point
            // on the circumference of the circle we've created
            // Now that the vectors for the centre of the circle and the wandering force have been created, simply add them together
            // to create the wandering force
            var wander_force = new Vector(0, 0);
            wander_force = centre_circle.add(displacement);
            
            if(this.eating || this.running away){ // Decreases the wandering force when eating or running away to prioritise these tasks
                force_wandering.mul(0.03);
            }
            this.applyForca(forca_vagueio.mul(0.2));
        // }
    }

    // Method that calculates the redirection force towards a target
    // REDIRECTION = DESIRED SPEED - SPEED
    chase(target){
        target.fleeing = true;
        // The desired velocity vector is the target's position vector minus the position vector itself
        var desired_speed = target.position.subNew(this.position); // A vector pointing from its location to the target.
        // Increase the desired speed to the maximum speed
        desired_speed.setMag(this.vel_max);

        // Redirection = desired speed - speed
        var redirection = vel_desired.subNew(this.vel);
        redirection.limit(this.force_max); // Limit the redirection to the maximum force

        // Adds the redirection force to the acceleration
        this.applyForca(redirection);
    }

    // Sexed reproductive behaviour method to search for nearby partners 
    searchPartners(){

    }

    // Sexed reproductive behaviour method for approaching the found partner 
    approachPartner(){
        // CALL METHOD HERE combineDnas()
    }

    // Sexed reproductive behaviour method to randomly choose genes from father and mother
    combinaDnas(partner){
        var dnaChild = [];

        // Initial radius
        if(Math.random() < 0.5){
            dnaChild.push(this.dna.initial_radius)
        } else{
            dnaChild.push(partner.dna.initial_radius)
        }

        // Maximum speed
        if(Math.random() < 0.5){
            dnaSon.push(this.dna.vel_max)
        } else{
            dnaChild.push(partner.dna.vel_max)
        }

        // Maximum force
        if(Math.random() < 0.5){
            dnaSon.push(this.dna.force_max)
        } else{
            dnaSon.push(partner.dna.force_max)
        }

        // Colour
        if(Math.random() < 0.5){
            dnaChild.push(this.dna.colour)
        } else{
            dnaChild.push(partner.dna.colour)
        }

        // Initial detection radius
        if(Math.random() < 0.5){
            dnaChild.push(this.dna.initial_detection_radius)
        } else{
            dnaChild.push(partner.dna.initial_detection_radius)
        }

        // Brood interval
        if(Math.random() < 0.5){
            dnaChild.push(this.dna.brood_interval)
        } else{
            dnaChild.push(partner.dna.brood_interval)
        }

        // Sex
        if(Math.random() < 0.5){
            dnaChild.push(this.dna.sex)
        } else{
            dnaChild.push(partner.dna.sex)
        }

        var dna_son = new DNA(dnaSon[0], dnaSon[1], dnaSon[2], dnaSon[3], 
            dnaChild[4], dnaChild[5], dnaChild[6])
        
        return dna_son;
    }

    thisDead(){
        return this.energy <= 0;
    }
    
    remove(list) {
        var what, a = arguments, L = a.length, index;
        while (L > 1 && list.length) {
            what = a[--L];
            while ((index = list.indexOf(what)) !== -1) {
                list.splice(index, 1);
            }
        }
        return list;
    }

    checkId(id){
        return (id == this.id);
    }
    
}