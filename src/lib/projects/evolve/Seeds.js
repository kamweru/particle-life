class Seeds {
  constructor(circles, rect) {
    this.circles = circles;
    this.rect = rect;
    this.title = "Seeds";
  }
  plantSeedTypeOne = () => {};
  plantSeedTypeTwo = () => {};
  plantSeedTypeThree = () => {};
  draw = (ctx) => {
    let { x, y, w, h } = this.rect;
    ctx.strokeStyle = "hsla(213, 31%, 81%, 1)";
    ctx.beginPath();
    ctx.roundRect(x, y, w, h, 10);
    ctx.stroke();
    ctx.fillStyle = "hsla(213, 31%, 81%, 1)";
    ctx.font = "32px Nunito";
    ctx.fillText(this.title, 20, y + h / 2, 140);
    for (let i = 0; i < this.circles.length; i++) {
      let { c, r, x, y } = this.circles[i];
      ctx.fillStyle = `hsla(${c}, 100%, 50%, 1)`;
      ctx.beginPath();
      ctx.arc(x, y, r, 0, 2 * Math.PI);
      ctx.closePath();
      ctx.fill();
    }
  };
}

export { Seeds };
