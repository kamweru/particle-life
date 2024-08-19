class Circle {
  constructor(x, y, r) {
    this.x = x;
    this.y = y;
    this.r = r;
  }

  // Check if the point is contained within its limits (boundaries)
  containPoint(point) {
    let xPoint = point.position.x;
    let yPoint = point.position.y;

    return (
      Math.sqrt(Math.pow(xPoint - this.x, 2) + Math.pow(yPoint - this.y, 2)) <=
      this.r // If the distance from the point to the circle is less than or equal to the radius
    );
  }

  // Method to find out if the rectangles intersect
  intersepta(range) {
    return !(
      // If this expression is true, they do NOT intersect

      (
        range.x - range.w > this.x + this.w ||
        range.x + range.w < this.x - this.w ||
        range.y - range.h > this.y + this.h ||
        range.y + range.h < this.y - this.h
      )
    );
  }
}
