import { frames } from "@typegpu/kit";
import * as web from "@typegpu/kit/web";
import { tgpu } from "typegpu";

import { createEditor } from "@/editor";
import { createScene } from "@/scene";

const canvas = document.querySelector<HTMLCanvasElement>("#view")!;
const status = document.querySelector<HTMLElement>("#status")!;
const release = document.querySelector<HTMLButtonElement>("#release")!;
const reset = document.querySelector<HTMLButtonElement>("#reset")!;
const crest = document.querySelector<HTMLInputElement>("#crest")!;
const crestValue = document.querySelector<HTMLOutputElement>("#crest-value")!;

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
