class Farm {
  constructor(actuators, rect) {
    this.actuators = actuators;
    this.rect = rect;
    this.title = "Farm";
    this.amount = 10;
    this.maxAmount = 1000;
    this.wasteAmount = 100;
    this.harvestAmount = 100;
  }
  sendToWaste(cb) {
    if (this.amount > this.wasteAmount) {
      this.amount -= this.wasteAmount;
      cb(this.wasteAmount);
    } else {
      cb(this.amount);
      this.amount = 0;
    }
  }
  // mature = () => {};
  harvest = (cb) => {
    if (this.amount > this.harvestAmount) {
      this.amount -= this.harvestAmount;
      cb(this.harvestAmount);
    } else {
      cb(this.amount);
      this.amount = 0;
    }
  };
  plant = (amount) => {
    this.amount += amount;
  };
  update = (ctx) => {
    this.draw(ctx);
    for (const actuator of this.actuators) {
      actuator.draw(ctx);
    }
  };
  draw = (ctx) => {
    let { x, y, w, h } = this.rect,
      percentage = this.amount / this.maxAmount;
    ctx.strokeStyle = "hsla(213, 31%, 81%, 1)";
    ctx.beginPath();
    ctx.roundRect(x, y, w, h, 10);
    ctx.stroke();
    ctx.fillStyle = "hsla(195, 75%, 70%, 0.625)";
    ctx.fillRect(x, y, w * percentage, h);
    ctx.fillStyle = "green";
    ctx.font = "32px Nunito";
    ctx.fillText(this.title, 20, y + h / 2);
  };
}

export { Farm };
