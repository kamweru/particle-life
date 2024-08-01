class Food{
    static food = [];
    static id = 0;

    constructor(x, y, radius){
        this.position = new Vector(x, y);
        this.radius = radius;
        // the energy of the piece of food is proportional to its area
        this.energy_food = Math.floor(Math.PI * Math.pow(this.radius, 2)) * 15;

        Food.food.push(this);

        // ID
        this.id = Food.id++;
    }

    display(){
        c.beginPath();
        c.arc(this.position.x, this.position.y, this.radius, 0, Math.PI * 2);
        c.fillStyle = ‘rgb(115, 158, 115)’;
        c.fill();
    }


    checkId(id){
        return (id == this.id);
    }
}