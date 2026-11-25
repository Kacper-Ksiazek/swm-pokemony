import * as web from "@typegpu/kit/web";

import type { FloodScene } from "@/scene";
import type { Point } from "@/world/walls";

type Tool = "camera" | "build" | "remove";

const HINTS: Record<Tool, string> = {
  camera: "Wybierz „Buduj” i przeciągnij po terenie, by postawić mur.",
  build: "Przeciągnij lewym przyciskiem, by postawić mur. Prawy przycisk obraca kamerę.",
  remove: "Kliknij mur, by go usunąć. Prawy przycisk obraca kamerę.",
};

/**
 * The wall editor on the page. In the camera tool the left button turns the view; while building
 * or removing walls the left button edits and the camera moves to the right button.
 */
export function createEditor(scene: FloodScene, canvas: HTMLCanvasElement) {
  const tools = [...document.querySelectorAll<HTMLButtonElement>("[data-tool]")];
  const height = document.querySelector<HTMLInputElement>("#wall-height")!;
  const heightValue = document.querySelector<HTMLOutputElement>("#wall-height-value")!;
  const clear = document.querySelector<HTMLButtonElement>("#clear-walls")!;
  const hint = document.querySelector<HTMLElement>("#hint")!;

  let tool: Tool = "camera";
  let controls = web.orbitControls(scene.view, canvas, { pan: true });
  let start: Point | undefined;

  const wallHeight = () => Number(height.value);
  const showHeight = () => (heightValue.textContent = `${height.value} m`);
  const showCount = () => {
    clear.disabled = scene.wallCount === 0;
  };

  const choose = (next: Tool) => {
    tool = next;
    start = undefined;
    scene.draft(undefined, undefined, wallHeight());
    scene.markWallAt(undefined);
    for (const button of tools)
      button.setAttribute("aria-pressed", String(button.dataset.tool === next));
    canvas.classList.toggle("building", next === "build");
    canvas.classList.toggle("removing", next === "remove");
    hint.textContent = HINTS[next];
    controls.destroy();
    controls = web.orbitControls(scene.view, canvas, {
      pan: true,
      button: next === "camera" ? "primary" : "secondary",
    });
  };

  const pointer = web.pointer(canvas, {
    menu: false,
    down: (x, y, event) => {
      if (event.button !== 0) return;
      const point = scene.groundUnder(x, y);
      if (tool === "build") start = point;
      if (tool === "remove") {
        const id = scene.markWallAt(point);
        if (id !== undefined) scene.removeWall(id);
        showCount();
      }
    },
    move: (x, y) => {
      const point = scene.groundUnder(x, y);
      if (tool === "build" && start) scene.draft(start, point, wallHeight());
      if (tool === "remove") scene.markWallAt(point);
    },
    up: (x, y, event) => {
      if (event.button !== 0 || tool !== "build" || !start) return;
      const end = scene.groundUnder(x, y);
      if (end && !scene.build(start, end, wallHeight())) {
        hint.textContent = "Mur jest za krótki albo stoi już ich za dużo.";
      }
      scene.draft(undefined, undefined, wallHeight());
      start = undefined;
      showCount();
    },
    leave: () => {
      if (tool === "remove") scene.markWallAt(undefined);
    },
  });

  for (const button of tools) {
    button.addEventListener("click", () => choose(button.dataset.tool as Tool));
  }
  height.addEventListener("input", showHeight);
  clear.addEventListener("click", () => {
    scene.clearWalls();
    showCount();
  });
  showHeight();
  showCount();

  return {
    destroy() {
      pointer.destroy();
      controls.destroy();
    },
  };
}
