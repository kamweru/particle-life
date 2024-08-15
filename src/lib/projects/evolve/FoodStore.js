class FoodStore {
  constructor(actuators, rect) {
    this.actuators = actuators;
    this.rect = rect;
    this.title = "FoodStore";
    this.action = "";
    this.amount = 1000;
    this.maxAmount = 1000;
    this.distributeAmount = 100;
    this.wasteAmount = 100;
  }
  sendToWaste = (cb) => {
    if (this.amount > this.wasteAmount) {
      this.amount -= this.wasteAmount;
      cb(this.wasteAmount);
    } else {
      cb(this.amount);
      this.amount = 0;
    }
  };
  distribute = () => {
    if (this.amount > this.distributeAmount) {
      this.amount -= this.distributeAmount;
      return this.distributeAmount;
    } else {
      // this.amount = 0;
      return this.amount;
    }
  };
  addAmount = (amount) => {
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
    ctx.fillStyle = "hsla(158, 100%, 50%, 0.625)";
    ctx.fillRect(x, y, w * percentage, h);
    ctx.fillStyle = "green";
    ctx.font = "32px Nunito";
    ctx.fillText(this.title, 20, y + h / 2);
    ctx.font = "32px Nunito";
    ctx.fillText(this.amount, 20, y + h);
  };
}

export { FoodStore };
