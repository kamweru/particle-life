import { writable } from "svelte/store";
import { config } from "./config";
const app = writable(config);
export const store = {
  subscribe: app.subscribe,
  set: (value) => app.set(value),
  update: (fn) => app.update(fn),
};
