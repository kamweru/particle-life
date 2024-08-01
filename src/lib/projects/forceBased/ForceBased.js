import { getRandomFromRange } from "../../utils";

const particle = (x, y, r, c) => ({
  x: x,
  y: y,
  r: r,
  vx: 0,
  vy: 0,
  c: c,
});

export const createParticles = (number, color, canvasWidth, canvasHeight) => {
  let group = Array.from({ length: number }, (v, i) => i).map((item) => {
    let r = getRandomFromRange(2, 3);
    let x = getRandomFromRange(0, canvasWidth - r);
    let y = getRandomFromRange(0, canvasHeight - r);
    return particle(x, y, r, color);
  });
  return group;
};
export const ForceBased = (() => {
  const createParticles = (number, color, canvasWidth, canvasHeight) => {
    let group = Array.from({ length: number }, (v, i) => i).map((item) => {
      let r = getRandomFromRange(2, 3);
      let x = getRandomFromRange(0, canvasWidth - r);
      let y = getRandomFromRange(0, canvasHeight - r);
      return particle(x, y, r, color);
    });
    return group;
  };
  const drawBitmap = (ctx, bitmap) => {
    ctx.drawImage(bitmap, 0, 0);
  };
  return {
    createParticles,
    drawBitmap,
  };
})();
