// Quadtree class definition
class Quadtree {
  constructor(bounds, capacity) {
    this.bounds = bounds;
    this.capacity = capacity;
    this.shapes = [];
    this.divided = false;
  }

  subdivide() {
    const { x, y, width, height } = this.bounds;
    const halfWidth = width / 2;
    const halfHeight = height / 2;

    this.northeast = new Quadtree(
      { x: x + halfWidth, y: y, width: halfWidth, height: halfHeight },
      this.capacity
    );
    this.northwest = new Quadtree(
      { x, y, width: halfWidth, height: halfHeight },
      this.capacity
    );
    this.southeast = new Quadtree(
      {
        x: x + halfWidth,
        y: y + halfHeight,
        width: halfWidth,
        height: halfHeight,
      },
      this.capacity
    );
    this.southwest = new Quadtree(
      { x, y: y + halfHeight, width: halfWidth, height: halfHeight },
      this.capacity
    );

    this.divided = true;
  }

  insert(shape) {
    if (!this.contains(this.bounds, shape)) {
      return false;
    }

    if (this.shapes.length < this.capacity) {
      this.shapes.push(shape);
      return true;
    }

    if (!this.divided) {
      this.subdivide();
    }

    if (this.northeast.insert(shape)) return true;
    if (this.northwest.insert(shape)) return true;
    if (this.southeast.insert(shape)) return true;
    if (this.southwest.insert(shape)) return true;

    return false;
  }

  contains(bounds, shape) {
    const shapeBounds = shape.getBounds();
    return (
      shapeBounds.x >= bounds.x &&
      shapeBounds.x + shapeBounds.width <= bounds.x + bounds.width &&
      shapeBounds.y >= bounds.y &&
      shapeBounds.y + shapeBounds.height <= bounds.y + bounds.height
    );
  }

  query(range, found) {
    if (!found) {
      found = [];
    }

    if (!this.intersects(range, this.bounds)) {
      return found;
    }

    for (const shape of this.shapes) {
      if (this.contains(range, shape)) {
        found.push(shape);
      }
    }

    if (this.divided) {
      this.northwest.query(range, found);
      this.northeast.query(range, found);
      this.southwest.query(range, found);
      this.southeast.query(range, found);
    }

    return found;
  }
  searchFood(range, found) {
    if (!found) {
      found = [];
    }

    if (!this.intersects(range, this.bounds)) {
      return found;
    }

    for (const shape of this.shapes) {
      if (range.containPoint(shape)) {
        if (shape.isFood) found.push(shape);
      }
    }

    if (this.divided) {
      this.northwest.searchFood(range, found);
      this.northeast.searchFood(range, found);
      this.southwest.searchFood(range, found);
      this.southeast.searchFood(range, found);
    }

    return found;
  }
  intersects(range, bounds) {
    return !(
      range.x > bounds.x + bounds.width ||
      range.x + range.width < bounds.x ||
      range.y > bounds.y + bounds.height ||
      range.y + range.height < bounds.y
    );
  }

  draw(ctx) {
    ctx.strokeStyle = "rgba(255,255,255, 0.75)";
    ctx.strokeRect(
      this.bounds.x,
      this.bounds.y,
      this.bounds.width,
      this.bounds.height
    );

    if (this.divided) {
      this.northeast.draw(ctx);
      this.northwest.draw(ctx);
      this.southeast.draw(ctx);
      this.southwest.draw(ctx);
    }
  }
}

export { Quadtree };
