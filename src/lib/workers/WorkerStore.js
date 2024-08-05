// WorkerStore.js

import { writable } from "svelte/store";
import { ParticleGridWorker } from "./ParticleGridWorker";

// Create a writable store for the worker
export const workerStore = writable(ParticleGridWorker);

// Listen for messages from the worker
ParticleGridWorker.addEventListener("message", (event) => {
  // Handle the message here (e.g., update other Svelte stores or components)
  console.log("Received message from worker:", event.data);
});
