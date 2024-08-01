class Carnivore extends Organism{
    static carnivores = [];
    static highlight = false;
   
    constructor(x, y, dna, parent = null){
        super(x, y, dna, parent); // referencing the constructor of the parent class
        
        // variable to count when a carnivore can reproduce
        this.count_for_reproduction = 0;

        Carnivore.carnivores.push(this);
    }

    // Reproduction method (with mutations)
    reproduce(){
        this.times_reproduced++;

        var dna_child = this._reproduce();
        var son = new Carnivore(
            this.position.x, this.position.y, dna_child, this
        );

        this.sons.push(son);
        
        return son;
    }

    reproduceSexual(partner){
        this.times_played++;

        var dna_child = this.combinaDnas(partner);
        var son = new Carnivore(
            this.position.x, this.position.y, dna_child, this
        )

        this.sons.push(son);

        return son;
    }

    die(){
        if(this.popover_id) deletePopover(this.popover_id, this.id);
        Carnivore.carnivores = super.remove(Carnivore.carnivores, this);
        Organism.organisms = super.remove(Organism.organisms, this);
    }

    fetchHerbivore(qtree, viewC){
        this.status = ‘looking for prey’
        this.eating = false;
        // Var record: what is the shortest distance (the record) of a herbivore so far?
        var record = Infinity; // Initially, we'll set this distance to infinity
        var i_closest = -1; // What is the index in the list of herbivores of the closest herbivore so far?

        // Insert a list of herbivores that are in your QuadTree into herbivores_next 
        let herbivores_nearest = qtree.searchHerbivores(viewC); // searchHerbivores() returns a list of herbivores
        // console.log(‘nearby herbivores’, nearby_herbivores);

        // Loop that analyses each herbivore in the list of herbivores
        for(var i = herbivores_proximos.length - 1; i >= 0; i--){
            // Distance d between this organism and the current herbivore being analysed in the list (herbivores_list[i])
            // var d = this.position.dist(list_herbivores[i].position);

            var d2 = Math.pow(this.position.x - nearby_herbivores[i].position.x, 2) + Math.pow(this.position.y - nearby_herbivores[i].position.y, 2);
            
            if (d2 <= record){ // If the distance is less than the record distance,
                record = d2; // record becomes the value of d
                i_most_last = i; // and the current feed becomes i_most_last 
            }
            
        }
        // Moment when it will eat!
        if(record <= Math.pow(this.radius_detection, 2)){
            this.eating = true;
            this.wandering = false;
            this.status = ‘hunting’

            nearby_herbivores[i_closest].fleeing = true;
            nearby_herbivores[i_closest].eating = false;
            nearby_herbivores[i_closest].wandering = false;
            nearby_herbivores[i_closest].status = ‘fleeing’;

            if(record <= 25){ // since record is distance squared, we square 5 (5^2 = 25) to compare
                
                // Loop to find the herbivore that contains the id of the closest herbivore in order to delete it from the static list based on its id 
                // Herbivore.herbivores.every(h => {
                // if(h.checkId(nearest_herbivores[i_closest].id)){
                // return false;
                // }

                // return true;
                // });

                this.comeHerbivore(nearby_herbivores[i_closest]);

                ///////////////////////////////////////////////////////////////////////////////
                // this.count_for_reproduction++;

                // if(this.count_for_reproduction >= 4){ // if the carnivore eats <count_for_reproduction> herbivores
                // if(Math.random() < this.chance_of_reproducing ){ // chance of reproducing
                // this.reproduce();
                // }
                // this.count_for_reproduction = 0; // reset the variable so that it can reproduce other times
                // }
                ///////////////////////////////////////////////////////////////////////////////
                
            } else if(herbivores_proximos.length != 0){
                this.chase(nearby_herbivores[i_closest]);
            }
        }
    }
    
    eatHerbivore(herbivore){
        this.age_eat++;
        // Energy absorption when eating the herbivore
        // If the energy it will acquire from the herbivore (10% of the herbivore's total energy)
        // is less than the amount left to fill the energy bar, it will be added in full (the 10%)

        if(this.energy_max - this.energy >= herbivore.energy_max * 0.1){
            this.energy += herbivore.energy_max * 0.1; // The carnivore, by eating the herbivore, gains 10% of the herbivore's energy
        } else{
   
            this.energy = this.energy_max; // Limiting the energy so that it doesn't exceed its maximum energy
        }
        
        if(this.energy > this.energy_max){
            this.energy = this.energy_max;
        }
        herbivore.dies() // The eaten herbivore dies (is removed from the list of herbivores)
        this.increaseSize();
    }

    display(){
        c.beginPath();
        c.arc(this.position.x, this.position.y, this.radius, 0, Math.PI * 2);

            if(Herbivore.highlight) {
            c.fillStyle = ‘rgba(’ + this.cor2.substr(5).replace(‘)’,‘’) + ‘,0.15)’;
            c.strokeStyle = ‘rgba(’ + this.cor.substr(4).replace(‘)’,‘’) + ‘,0.15)’;
        
        } else {
            c.fillStyle = this.cor2;

            c.strokeStyle = this.colour;
        }

        c.lineWidth = 5;
        c.stroke();
        c.fill();

        // drawing the detection radius
        // c.beginPath();
        // c.arc(this.position.x, this.position.y, this.radius_detection, 0, Math.PI * 2);
        // c.strokeStyle = ‘grey’;
        // c.stroke();
    }
}