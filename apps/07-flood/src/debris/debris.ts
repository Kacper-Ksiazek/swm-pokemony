import type { cameras } from "@typegpu/kit";
import { d, type TgpuComputePass, type TgpuRoot } from "typegpu";

import type { Building } from "@/world/layout";

import { createChunks, type Water } from "./chunks";
import { createDust } from "./dust";

/** Chunks and puffs one fallen building throws, scaled by its size. */
const CHUNKS_PER_CUBIC_METRE = 0.1;
const PUFFS_PER_SQUARE_METRE = 0.35;

/**
 * Rubble and dust thrown up by falling buildings. Chunks drop, rest on the ground, or float at
 * the surface and ride the current; dust billows up and slowly settles.
 */
export function createDebris(
  root: TgpuRoot,
  view: cameras.CameraBase,
  water: Water,
  options: { step: number },
) {
  /** How much daylight there is to light the dust, from 1 at noon to near 0 at night. */
  const daylight = root.createUniform(d.f32, 1);

  const { chunks, shatter } = createChunks(root, view, water, options);

  const dust = createDust(root, view, daylight, options);

  return {
    drawings: [chunks.drawing, dust.drawing],

    /** Sets how much daylight lights the dust, from 1 at noon to near 0 at night. */
    setDaylight(amount: number) {
      daylight.write(amount);
    },
    shatter,
    initAsync: () => Promise.all([chunks.initAsync(), dust.initAsync()]),

    /** Throws rubble and dust from a building that starts to fall, toward where it falls. */
    collapse(
      building: Pick<Building, "x" | "z" | "base" | "width" | "depth" | "height" | "color">,
      toward: readonly [number, number],
      /** Falling masonry raises dust; timber breaking over water does not. */
      options: { readonly dust?: boolean } = {},
    ) {
      const volume = building.width * building.depth * building.height;
      const footprint = building.width * building.depth;
      const middle = building.base + building.height * 0.5;
      chunks.burst({
        count: Math.min(Math.round(volume * CHUNKS_PER_CUBIC_METRE), 600),
        position: [building.x, middle, building.z],
        area: [building.width / 2, building.height / 2, building.depth / 2],
        velocity: [toward[0] * 3, 1, toward[1] * 3],
        scatter: 3,
        color: [...building.color, 1],
        size: 0.7,
        life: 18,
        variance: 0.5,
      });

      if (options.dust === false) return;

      dust.burst({
        count: Math.min(Math.round(footprint * PUFFS_PER_SQUARE_METRE), 120),
        position: [building.x, building.base + 2, building.z],
        area: [building.width / 2, 1.5, building.depth / 2],
        velocity: [toward[0] * 1.5, 1.5, toward[1] * 1.5],
        scatter: 2.5,
        color: [1, 1, 1, 0.45],
        size: 4,
        life: 7,
        variance: 0.4,
      });
    },

    /** Spawns this frame's bursts; call once per frame before the steps. */
    spawn(pass: TgpuComputePass) {
      chunks.spawn(pass);
      dust.spawn(pass);
    },

    step(pass: TgpuComputePass) {
      chunks.step(pass);
      dust.step(pass);
    },

    compact(pass: TgpuComputePass, ahead: number) {
      chunks.compact(pass, ahead);
      dust.compact(pass, ahead);
    },

    clear(encoder: Parameters<typeof chunks.clear>[0]) {
      chunks.clear(encoder);
      dust.clear(encoder);
    },

    destroy() {
      chunks.destroy();
      dust.destroy();
    },
  };
}
