/**
 * Generates a random hexadecimal string of the specified length.
 * @param {number} n - The length of the string to generate.
 * @returns {string} - The generated hexadecimal string.
 */
export let uuid = (n = 20) => {
  // Define the possible characters to use
  const DIGITS = "0123456789";
  const ALPHABET = "ABCDEFGHIJKLMNOPQRSTUVWXYZ";
  const ALPHABET_LOWERCASE = ALPHABET.toLocaleLowerCase();
  const ALPHANUMERIC = ALPHABET + ALPHABET_LOWERCASE + DIGITS;
  // Initialize an empty string to store the output
  let output = "";
  // Loop n times
  while (n--) {
    // Pick a random index from 0 to IDX - 1
    let index = Math.floor(Math.random() * ALPHANUMERIC.length);
    // Append the character at that index to the output
    output += ALPHANUMERIC[index];
  }
  // Return the output
  return output;
};

export const getRandomFromRange = (min, max) =>
  Math.floor(Math.random() * (max - min + 1) + min);
export const getRandomFloat = () => {
  return parseFloat((Math.random() * 2 - 1).toFixed(3));
};
export const range = (start, stop, step = 1) =>
  Array.from({ length: (stop - start) / step + 1 }, (_, i) => start + i * step);

// src/actions/longpress.js
export function longpress1(node, options) {
  let intervalId = null;

  function startAction() {
    // Replace this with your desired action
    console.log("Button pressed and held!");

    // Set an interval to repeat the action
    intervalId = setInterval(() => {
      // Replace this with your desired action
      console.log("Button held: repeating action...");
    }, options.interval || 200); // Default interval is 200ms
  }

  function stopAction() {
    clearInterval(intervalId);
    console.log("Button released: action stopped.");
  }

  node.addEventListener("mousedown", startAction);
  node.addEventListener("mouseup", stopAction);
  node.addEventListener("touchstart", startAction);
  node.addEventListener("touchend", stopAction);

  return {
    destroy() {
      clearInterval(intervalId);
      node.removeEventListener("mousedown", startAction);
      node.removeEventListener("mouseup", stopAction);
      node.removeEventListener("touchstart", startAction);
      node.removeEventListener("touchend", stopAction);
    },
  };
}

export function longpress(node, options) {
  let intervalId = null,
    interval = 200;
  if (options && options.interval) interval = options.interval;

  function startAction() {
    // Replace this with your desired action
    // console.log("Button pressed and held!");
    if (options && options.cb) options.cb();

    // Set an interval to repeat the action
    intervalId = setInterval(() => {
      // Replace this with your desired action
      // console.log("Button held: repeating action...");
      if (options && options.cb) options.cb();
    }, interval);
  }

  function stopAction() {
    clearInterval(intervalId);
    // console.log("Button released: action stopped.");
  }

  node.addEventListener("mousedown", startAction);
  node.addEventListener("mouseup", stopAction);
  node.addEventListener("touchstart", startAction);
  node.addEventListener("touchend", stopAction);

  return {
    destroy() {
      clearInterval(intervalId);
      node.removeEventListener("mousedown", startAction);
      node.removeEventListener("mouseup", stopAction);
      node.removeEventListener("touchstart", startAction);
      node.removeEventListener("touchend", stopAction);
    },
  };
}
