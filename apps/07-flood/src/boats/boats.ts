import { pipelines, type meshPool } from "@typegpu/kit";
import type { TgpuComputePass, TgpuRoot, TgpuUniform } from "typegpu";
import { d } from "typegpu";

import type { Evening } from "@/buildings";
import type { Mooring } from "@/world/beach";

import { createHull } from "./hull";
import { createStep, Float, floatSlots, MOORED, Sea, type Water } from "./step";

/**
 * Boats and buoys on the GPU. Moored, they ride the swell at the end of their ropes and turn to
 * the breeze; a fast current or a surge snaps the rope, and the flood carries them like the cars,
 * into walls and each other, until they run aground and lie over on their sides.
 */
export function createBoats(
  root: TgpuRoot,
  pool: meshPool.MeshPool,
  water: Water,
  moorings: readonly Mooring[],
  evening: TgpuUniform<typeof Evening>,
  random: () => number,
) {
  const count = Math.max(moorings.length, 1);
  const floats = root.createBuffer(floatSlots(count)).$usage("storage");
  const floatsOut = floats.as("mutable");
  /** Only the drawing reads this view: a kernel may not bind one buffer both ways at once. */
  const floatsIn = floats.as("readonly");
  const sea = root.createUniform(Sea, { dt: 0, time: 0 });

  const step = createStep(root, { water, count, floatsOut, sea });
  const hull = createHull(root, pool, { floatsIn, sea, evening, moorings, random });

  const moored = () =>
    moorings.map((mooring, i) =>
      Float({
        position: d.vec3f(mooring.anchor[0], 0, mooring.anchor[1]),
        mode: MOORED,
        velocity: d.vec3f(0),
        heading: mooring.heading,
        anchor: d.vec2f(...mooring.anchor),
        rope: mooring.rope,
        kind: mooring.kind,
        spin: 0,
        age: 0,
        seed: (i * 0.618) % 1,
        damage: 0,
        flip: 0,
      }),
    );
  floats.write(moored());

  return {
    renderer: hull.renderer,
    initAsync: () => pipelines.compile([step.stepping]),

    /** Sets the step length and the clock, once a frame before the steps. */
    prepare(dt: number, time: number) {
      sea.write({ dt, time });
    },

    step(pass: TgpuComputePass) {
      step.step(pass);
    },

    /** Every boat and buoy back on its mooring. */
    reset() {
      floats.write(moored());
    },

    destroy() {
      hull.destroy();
      floats.destroy();
    },
  };
}
