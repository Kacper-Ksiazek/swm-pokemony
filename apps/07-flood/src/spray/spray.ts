import { particles, pipelines, type cameras } from "@typegpu/kit";
import type { TgpuRoot } from "typegpu";

import { createDraw } from "./draw";
import { createThrow, type Water } from "./throw";

/** Droplets alive at once. */
const CAPACITY = 8000;

/**
 * Spray thrown up where the flood strikes walls, buildings and the shore. Each frame every cell
 * the water runs hard into something has a chance to throw a droplet up and back, so the spray
 * is thickest where the water hits hardest.
 */
export function createSpray(
  root: TgpuRoot,
  view: cameras.CameraBase,
  water: Water,
  options: { step: number },
) {
  const drawn = createDraw(root);

  const drops = particles.create(root, view, {
    capacity: CAPACITY,
    step: options.step,
    label: "spray",
    blend: "over",
    shade: drawn.shade,
    settings: { gravity: [0, -9.81, 0], drag: 0.9 },
  });

  const thrown = createThrow(root, drops, water);
  const { throwing } = thrown;

  return {
    drawing: drops.drawing,

    setDaylight: drawn.setDaylight,
    initAsync: () => Promise.all([drops.initAsync(), pipelines.compile([throwing])]),

    throw: thrown.throw,

    spawn: thrown.spawn,

    step: thrown.step,

    compact: thrown.compact,

    clear(encoder: Parameters<typeof drops.clear>[0]) {
      drops.clear(encoder);
    },

    destroy() {
      drops.destroy();
    },
  };
}
