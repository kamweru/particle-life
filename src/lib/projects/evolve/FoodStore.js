class FoodStore {
  constructor(actuators, rect) {
    this.actuators = actuators;
    this.rect = rect;
    this.title = "FoodStore";
    this.action = "";
    this.amount = 1000;
    this.distributeAmount = 100;
  }
  sendToWaste = () => {
    console.log("send to waste");
  };
  distribute = (cb) => {
    if (this.amount > this.distributeAmount) {
      cb(this.distributeAmount);
      this.amount -= this.distributeAmount;
    } else {
      cb(this.amount);
      this.amount = 0;
    }
    // console.log("distribute");
  };
  update = (ctx) => {
    this.draw(ctx);
    for (const actuator of this.actuators) {
      actuator.draw(ctx);
      if (actuator.active) {
        this.action = actuator.action;
      }
    }
  };
  draw = (ctx) => {
    let { x, y, w, h } = this.rect;
    ctx.strokeStyle = "hsla(213, 31%, 81%, 1)";
    ctx.beginPath();
    ctx.roundRect(x, y, w, h, 10);
    ctx.stroke();
    ctx.fillStyle = "hsla(158, 100%, 50%, 1)";
    ctx.fillRect(x, y, w / 2, h);
    ctx.fillStyle = "green";
    ctx.font = "32px Nunito";
    ctx.fillText(this.title, 20, y + h / 2);
    ctx.font = "32px Nunito";
    ctx.fillText(this.amount, 20, y + h);
    // if (this.action === "distribute") {
    //   ctx.fillStyle = "hsla(213, 31%, 81%, 1)";
    //   ctx.beginPath();
    //   ctx.arc(800, 375, 100, 0, 2 * Math.PI);
    //   ctx.fill();
    //   // ctx.fillStyle = "hsla(13, 31%, 81%, 1)";
    //   // ctx.fillText(this.title, 800, 375);
    // }
  };
}

export { FoodStore };
