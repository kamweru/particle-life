class Waste {
  constructor(actuators, rect) {
    this.actuators = actuators;
    this.rect = rect;
    this.title = "Waste";
    this.amount = 10;
    this.maxAmount = 1000;
  }
  sendToProcessor = () => {
    console.log("send to processor");
  };
  addWaste = (amount) => {
    this.amount += amount;
    // console.log("add waste");
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
    ctx.fillStyle = "hsla(206, 6%, 25%, 1)";
    ctx.fillRect(x, y, w * percentage, h);
    ctx.fillStyle = "green";
    ctx.font = "32px Nunito";
    ctx.fillText(this.title, 20, y + h / 2);
  };
}

export { Waste };
