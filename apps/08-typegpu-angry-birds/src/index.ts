import * as web from "@typegpu/kit/web";

import { createScene } from "@/scene.ts";

const canvas = document.querySelector<HTMLCanvasElement>("#view")!;
const status = document.querySelector<HTMLElement>("#status")!;

if (!navigator.gpu) {
  status.textContent = "Ta przeglądarka nie obsługuje WebGPU (spróbuj Chrome/Edge).";
} else {
  const hosted = web.host(createScene, {
    canvas,
    attach: (stage) => {
      const controls = web.orbitControls(stage.scene.view, canvas);
      return () => controls.destroy();
    },
  });

  status.textContent = "Etap 2: forteca z bloków — jeden mesh, wiele wierszy w instances.";

  window.addEventListener("pagehide", () => hosted.destroy());
}
