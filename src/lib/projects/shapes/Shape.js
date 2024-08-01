class Shape {
  constructor(x, y, color, velocityX, velocityY) {
    this.x = x;
    this.y = y;
    this.color = color;
    this.velocityX = velocityX;
    this.velocityY = velocityY;
  }

  // Method to update the position of the shape
  update() {
    this.x += this.velocityX;
    this.y += this.velocityY;

    // Simple boundary collision detection and response
    if (this.x < 0 || this.x > canvas.width) {
      this.velocityX *= -1;
    }
    if (this.y < 0 || this.y > canvas.height) {
      this.velocityY *= -1;
    }
  }

  // Placeholder methods to be overridden by subclasses
  draw(ctx) {}
  isCollidingWith(otherShape) {
    return false;
  }
  mergeWith(otherShape) {
    return null;
  }
  getBounds() {
    return { x: this.x, y: this.y, width: 0, height: 0 };
  }
}
