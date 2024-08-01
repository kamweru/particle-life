class QuadTree {
  constructor(limit, capacity) {
    this.limit = limit; // Attribute of type Rectangle
    this.capacity = capacity; // From how many points (in this case, living beings) the rectangle is subdivided
    this.points = [];
    this.food = [];
    this.herbivores = [];
    this.carnivores = [];
    // this.seresVivos = this.alimentos.concat(this.herbivores, this.carnivores); // Array containing all foods, herbivores and carnivores within its root
    this.split = false;
  }

  // Subdivide the QuadTree into 4 child rectangles
  subdivide() {
    let x = this.limit.x;
    let y = this.limit.y;
    let w = this.limit.w;
    let h = this.boundary.h;

    let ne = new Rectangle(x + w / 2, y - h / 2, w / 2, h / 2);
    this.northeast = new QuadTree(ne, this.capacity);

    let no = new Rectangle(x - w / 2, y - h / 2, w / 2, h / 2);
    this.northwest = new QuadTree(no, this.capacity);

    let se = new Rectangle(x + w / 2, y + h / 2, w / 2, h / 2);
    this.southeast = new QuadTree(se, this.capacity);

    let so = new Rectangle(x - w / 2, y + h / 2, w / 2, h / 2);
    this.southwest = new QuadTree(so, this.capacity);

    this.split = true;
  }

  insertPoint(point) {
    if (!this.boundary.containsPoint(point)) {
      // Check if the point is contained within the boundaries of the root rectangle
      return false;
    }

    if (this.points.length < this.capacity) {
      this.points.push(point);
      return true;
    } else {
      // If the maximum capacity has been reached
      if (!this.split) {
        // The QuadTree will not subdivide if it has already done so
        this.subdivide();
      }

      // We don't check the location of the point because it will be checked at the beginning of each call of these methods
      if (this.northeast.insertPoint(point)) {
        return true;
      } else if (this.northwest.insertPoint(point)) {
        return true;
      } else if (this.southeast.insertPoint(point)) {
        return true;
      } else if (this.southwest.insertPoint(point)) {
        return true;
      }
    }
  }

  insertFood(food) {
    if (!this.limit.containsPoint(food)) {
      // Check if the food is contained within the limits (borders) of the root rectangle
      return false;
    }

    if (this.food.length < this.capacity) {
      // If there is still food inside it
      this.food.push(food); // Insert the food into your list
      // console.log("food ’, this.food);
      return true;
    } else {
      // If the maximum capacity of living beings has been reached
      if (!this.split) {
        // The QuadTree will not subdivide if it has already done so
        // console.log(‘insertFood’, this.food);
        this.subdivide();
        // console.log(‘SUBDIVIDED - A’, this.capacity);
      }

      // We don't check the location of the food because it will be checked at the beginning of each call to these methods
      if (this.northeast.insertFood(food)) {
        return true;
      } else if (this.northwest.insertFood(food)) {
        return true;
      } else if (this.southeast.insertFood(food)) {
        return true;
      } else if (this.southwest.insertFood(food)) {
        return true;
      }
    }
  }

  insertHerbivore(herbivore) {
    if (!this.limite.contemPonto(herbivoro)) {
      // Check if the herbivore is contained within the limits (borders) of the root rectangle
      return false;
    }

    if (this.herbivores.length < this.capacity) {
      // If there are still herbivores inside it
      this.herbivores.push(herbivore); // Insert the herbivore into your list
      return true;
    } else {
      // If the maximum capacity of living beings has been reached
      if (!this.split) {
        // The QuadTree will not subdivide if it has already done so
        this.subdivide();
      }

      // We don't check the location of the herbivore because it will be checked at the beginning of each call of these methods
      if (this.northeast.insertHerbivore(herbivore)) {
        return true;
      } else if (this.northwest.insertHerbivore(herbivore)) {
        return true;
      } else if (this.southeast.insertHerbivore(herbivore)) {
        return true;
      } else if (this.southwest.insertHerbivore(herbivore)) {
        return true;
      }
    }
  }

  insertCarnivore(carnivore) {
    if (!this.limite.contemPonto(carnivoro)) {
      // Check if the carnivore is contained within the limits (borders) of the root rectangle
      return false;
    }

    if (this.carnivores.length < this.capacity) {
      // If there are still carnivores in it
      // console.log(‘GIVING PUSH’);
      this.carnivores.push(carnivore); // Insert the carnivore into your list
      // console.log("carnivores ’, this.carnivores);
      return true;
    } else {
      // If the maximum capacity of living beings has been reached
      if (!this.split) {
        // The QuadTree will not subdivide if it has already done so
        // console.log(‘insertCarnivores’, this.carnivores);
        this.subdivide();
        // console.log(‘SUBDIVIDED - C’, this.capacity);
      }

      // We don't check the location of the carnivore because it will be checked at the beginning of each call to these methods
      if (this.nordeste.inserirCarnivoro(carnivoro)) {
        return true;
      } else if (this.noroeste.inserirCarnivoro(carnivoro)) {
        return true;
      } else if (this.sudeste.inserirCarnivoro(carnivoro)) {
        return true;
      } else if (this.southwest.insertCarnivore(carnivore)) {
        return true;
      }
    }
  }

  searchPoints(range, found) {
    // range is of type Rectangle
    if (!found) {
      found = [];
    }
    if (!this.limit.intersect(range)) {
      // If they do NOT intersect, do not execute the code
      return;
    } else {
      // If they intersect
      for (let p of this.points) {
        // For the points of this QuadTree
        if (range.containsPoint(p)) {
          // If the point belongs to the ‘range’ rectangle
          found.push(p);
        }
      }

      if (this.split) {
        // If the QuadTree has child QuadTrees
        this.northwest.searchPoints(range, found);
        this.northeast.searchPoints(range, found);
        this.southwest.searchPoints(range, found);
        this.southeast.searchPoints(range, found);
      }

      return found;
    }
  }

  searchFood(circle, found) {
    if (!found) {
      found = [];
    }
    if (!this.limit.interseptaC(circle)) {
      // If they do NOT intersect, do not execute the code
      return found;
    } else {
      // If they intersect
      for (let a of this.foods) {
        // For the foods in this QuadTree
        if (circle.containsPoint(a)) {
          // If the food belongs to the circle
          found.push(a);
        }
      }

      if (this.split) {
        // If the QuadTree has child QuadTrees
        this.northwest.searchFood(circle, found);
        this.northeast.searchFood(circle, found);
        this.southwest.searchFood(circle, found);
        this.south - east.searchFood(circle, found);
      }

      return found;
    }
  }

  searchHerbivores(circle, found) {
    if (!found) {
      found = [];
    }
    if (!this.limit.interseptaC(circle)) {
      // If they do NOT intersect, do not execute the code
      return found;
    } else {
      // If they intersect
      for (let h of this.herbivores) {
        // For the herbivores of this QuadTree
        if (circle.containsPoint(h)) {
          // If the herbivore belongs to the circle
          found.push(h);
        }
      }

      if (this.split) {
        // If the QuadTree has child QuadTrees
        this.northwest.searchHerbivores(circle, found);
        this.northeast.searchHerbivores(circle, found);
        this.southwest.searchHerbivores(circle, found);
        this.southeast.searchHerbivores(circle, found);
      }

      return found;
    }
  }

  draw() {
    // c.lineWidth = 1;
    c.beginPath();
    c.rect(
      this.limit.x - this.limit.w,
      this.limit.y - this.limit.h,
      this.limit.w * 2,
      this.limit.h * 2
    );
    c.stroke();
    if (this.divided) {
      this.north - east.draw();
      this.northwest.draw();
      this.south - east.draw();
      this.southwest.draw();
    }
    // for(let a of this.alimentos){
    // c.beginPath();
    // c.arc(a.position.x, a.position.y, 1, 0, 2 * Math.PI);
    // c.stroke();
    // }
    // for(let h of this.herbivores){
    // c.beginPath();
    // c.arc(h.position.x, h.position.y, 1, 0, 2 * Math.PI);
    // c.stroke();
    // }
    // for(let ca of this.carnivores){
    // c.beginPath();
    // c.arc(ca.position.x, ca.position.y, 1, 0, 2 * Math.PI);
    // c.stroke();
    // }
  }
}
