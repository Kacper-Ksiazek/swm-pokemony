import { frames } from "@typegpu/kit";
import * as web from "@typegpu/kit/web";
import { tgpu } from "typegpu";

import { createEditor } from "@/editor";
import { createScene, type Cinema } from "@/scene";

const canvas = document.querySelector<HTMLCanvasElement>("#view")!;
const status = document.querySelector<HTMLElement>("#status")!;
const release = document.querySelector<HTMLButtonElement>("#release")!;
const reset = document.querySelector<HTMLButtonElement>("#reset")!;
const crest = document.querySelector<HTMLInputElement>("#crest")!;
const crestValue = document.querySelector<HTMLOutputElement>("#crest-value")!;
const hour = document.querySelector<HTMLInputElement>("#hour")!;
const hourValue = document.querySelector<HTMLOutputElement>("#hour-value")!;

async function start() {
  if (!navigator.gpu) {
    status.textContent = "Ta przeglądarka nie obsługuje WebGPU.";
    return;
  }

  const root = await tgpu.init();
  // Multisampling already smooths edges, so 1.5 device pixels per CSS pixel look as sharp as 2
  // on a retina screen and draw about half as many pixels
  const surface = web.surface(root, canvas, { maxPixelRatio: 1.5 });
  const scene = await createScene(root, surface);
  const editor = createEditor(scene, canvas);
  const loop = frames.create(root, (frame) => scene.frame(frame));
  const animation = frames.animate(loop, { surface });

  const showHour = () => {
    const minutes = Math.round(Number(hour.value) * 60);
    hourValue.textContent = `${Math.floor(minutes / 60)}:${String(minutes % 60).padStart(2, "0")}`;
    scene.setHour(Number(hour.value));
  };
  showHour();
  hour.addEventListener("input", showHour);
  const showCrest = () => (crestValue.textContent = `${crest.value} m`);
  showCrest();
  crest.addEventListener("input", showCrest);
  release.addEventListener("click", () => {
    scene.release(Number(crest.value));
    status.textContent = "Fala nadchodzi!";
  });
  reset.addEventListener("click", () => {
    scene.reset();
    status.textContent = "Spokojne morze.";
  });
  const cinemas = [...document.querySelectorAll<HTMLButtonElement>("[data-cinema]")];
  for (const button of cinemas) {
    button.addEventListener("click", () => {
      scene.setCinema(button.dataset.cinema as Cinema);
      for (const other of cinemas) other.setAttribute("aria-pressed", String(other === button));
    });
  }
  const storm = document.querySelector<HTMLButtonElement>("#storm")!;
  storm.addEventListener("click", () => {
    const on = storm.getAttribute("aria-pressed") !== "true";
    storm.setAttribute("aria-pressed", String(on));
    scene.setStorm(on);
  });
  status.textContent = "Spokojne morze.";
  release.disabled = false;
  reset.disabled = false;

  window.addEventListener("pagehide", () => {
    animation.destroy();
    loop.destroy();
    editor.destroy();
    scene.destroy();
    surface.destroy();
  });
}

start().catch((error: unknown) => {
  console.error(error);
  status.textContent = `Błąd: ${error instanceof Error ? error.message : String(error)}`;
});
