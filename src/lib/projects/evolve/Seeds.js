class Seeds {
  constructor(actuators, rect) {
    this.actuators = actuators;
    this.rect = rect;
    this.title = "Seeds";
    this.amount = 1000;
    this.maxAmount = 1000;
    this.plantAmount = 100;
  }
  plantSeedTypeOne = (cb) => {
    if (this.amount > this.plantAmount) {
      this.amount -= this.plantAmount;
      cb(this.plantAmount);
    } else {
      cb(this.amount);
      this.amount = 0;
    }
  };
  plantSeedTypeTwo = (cb) => {
    if (this.amount > this.plantAmount) {
      this.amount -= this.plantAmount;
      cb(this.plantAmount);
    } else {
      cb(this.amount);
      this.amount = 0;
    }
  };
  plantSeedTypeThree = (cb) => {
    if (this.amount > this.plantAmount) {
      this.amount -= this.plantAmount;
      cb(this.plantAmount);
    } else {
      cb(this.amount);
      this.amount = 0;
    }
  };
  update = (ctx) => {
    this.draw(ctx);
    for (const actuator of this.actuators) {
      actuator.draw(ctx);
    }
  };
  draw = (ctx) => {
    let { x, y, w, h } = this.rect;
    ctx.strokeStyle = "hsla(213, 31%, 81%, 1)";
    ctx.beginPath();
    ctx.roundRect(x, y, w, h, 10);
    ctx.stroke();
    ctx.fillStyle = "hsla(213, 31%, 81%, 1)";
    ctx.fillRect(x, y, w / 2, h);
    ctx.fillStyle = "green";
    ctx.font = "32px Nunito";
    ctx.fillText(this.title, 20, y + h / 2);
  };
}

export { Seeds };
