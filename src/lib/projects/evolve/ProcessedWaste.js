class ProcessedWaste {
  constructor(actuators, rect) {
    this.actuators = actuators;
    this.rect = rect;
    this.title = "Processed Waste";
  }
  fertilizeFarm = () => {
    console.log("fertilize farm");
  };
  processWaste = () => {
    console.log("process waste");
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
    ctx.fillStyle = "hsla(335, 30%, 43%, 1)";
    ctx.fillRect(x, y, w / 2, h);
    ctx.fillStyle = "green";
    ctx.font = "32px Nunito";
    ctx.fillText(this.title, 20, y + h / 2);
  };
}

export { ProcessedWaste };
