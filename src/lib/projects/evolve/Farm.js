class Farm {
  constructor(actuators, rect) {
    this.actuators = actuators;
    this.rect = rect;
    this.title = "Farm";
  }
  sendToWaste = () => {
    console.log("send to waste");
  };
  // mature = () => {};
  harvest = () => {
    console.log("harvest");
  };
  update = (ctx) => {
    this.draw(ctx);
    for (const actuator of this.actuators) {
      actuator.draw(ctx);
      if (actuator.active) {
        this[actuator.action]();
      }
    }
  };
  draw = (ctx) => {
    let { x, y, w, h } = this.rect;
    ctx.strokeStyle = "hsla(213, 31%, 81%, 1)";
    ctx.beginPath();
    ctx.roundRect(x, y, w, h, 10);
    ctx.stroke();
    ctx.fillStyle = "hsla(195, 75%, 70%, 1)";
    ctx.fillRect(x, y, w / 2, h);
    ctx.fillStyle = "green";
    ctx.font = "32px Nunito";
    ctx.fillText(this.title, 20, y + h / 2);
  };
}

export { Farm };
