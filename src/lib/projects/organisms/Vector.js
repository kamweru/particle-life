// class for constructing vectors
class Vector {
  constructor(x, y) {
    this.x = x;
    this.y = y;
  }

  // resets the x and y values of the vector to the specified values
  set(x, y) {
    this.x = x;
    this.y = y;
  }

  // return the size of the vector squared
  magSq() {
    var x = this.x,
      y = this.y;
    return x * x + y * y;
  }

  // return the size of the vector
  mag() {
    return Math.sqrt(this.magSq());
  }

  // sum the current vector with a new specified one and return the (updated) vector itself, not a new one
  add(v) {
    this.x += v.x;
    this.y += v.y;
    return this;
  }

  // subtracts a specified vector from the current one and returns the (updated) vector itself, not a new one
  sub(v) {
    this.x -= v.x;
    this.y -= v.y;
    return this;
  }

  // subtracts a specified vector from the current one and returns a new one
  subNew(v) {
    var x = this.x - v.x;
    var y = this.y - v.y;
    return new Vector(x, y);
  }

  // returns this vector after dividing it by a specified value
  // is used to reduce the size of a vector. So if n is two, the vector will be half the size
  div(n) {
    this.x /= n;
    this.y /= n;
    return this;
  }

  // returns this vector after multiplying it by a specified value
  // is used to increase the size of a vector. Thus, if n is two, the vector will be twice the size
  mul(n) {
    this.x *= n;
    this.y *= n;
    return this;
  }

  // change the size of a vector to 1 (this is called normalising a vector)
  normalise() {
    // divides the vector itself by the vector returned in mag(), i.e. divides itself by its size,
    // resulting in 1
    return this.div(this.mag());
  }

  // change the size of the vector to a specified value
  setMag(n) {
    // normalise (change the size to 1) and then multiply by n
    return this.normalise().mul(n);
  }

  // return the distance between two points (defined by x and y of a vector v)
  dist(v) {
    var d = v.copy().sub(this);
    return d.mag();
  }

  // limit the size of the vector to a threshold value (we use this method to limit speed, for example)
  limit(l) {
    var mSq = this.magSq();
    if (mSq > l * l) {
      this.div(Math.sqrt(mSq));
      this.mul(l);
    }
    return this;
  }

  // return the direction in which the vector is pointing (in radians)
  headingRads() {
    var h = Math.atan2(this.y, this.x);
    return h;
  }

  // return the direction in which the vector is pointing (in degrees)
  headingDegs() {
    var r = Math.atan2(this.y, this.x);
    var h = (r * 180.0) / Math.PI;
    return h;
  }

  // rotate the vector by ‘a’ radians
  // we can use this to rotate the drawing of the animal so that it is always aligned with its movement
  rotateRads(a) {
    var newHead = this.headingRads() + a;
    var mag = this.mag();
    this.x = Math.cos(newHead) * mag;
    this.y = Math.sin(newHead) * mag;
    return this;
  }

  // rotate the vector by ‘a’ degrees
  rotateDegs(a) {
    a = (a * Math.PI) / 180.0;
    var newHead = this.headingRads() + a;
    var mag = this.mag();
    this.x = Math.cos(newHead) * mag;
    this.y = Math.sin(newHead) * mag;
    return this;
  }

  // return the angle between two vectors (in radians) --> /\
  angleBetweenDegs(x, y) {
    var r = this.angleBetweenRads(x, y);
    var d = (r * 180) / Math.PI;
    return d;
  }

  // checks if two vectors are identical and returns a boolean
  equals(x, y) {
    var a, b;
    if (x instanceof Vector) {
      a = x.x || 0;
      b = x.y || 0;
    } else {
      a = x || 0;
      b = y || 0;
    }

    return this.x === a && this.y === b;
  }

  // return a copy of this vector
  copy() {
    return new Vector(this.x, this.y);
  }
}

export { Vector };
