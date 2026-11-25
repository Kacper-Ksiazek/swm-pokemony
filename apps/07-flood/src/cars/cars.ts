import { pipelines, type meshPool } from "@typegpu/kit";
import type { TgpuComputePass, TgpuRoot } from "typegpu";

import { createMesh } from "./mesh";
import { Car, CARS, carSlots, createStep, Drive, type Debris, type Water } from "./step";

/**
 * Cars that drive the road grid and that the flood picks up. Every car lives in one GPU buffer:
 * a kernel steers them along lanes, turns them at junctions and keeps them apart, then lets the
 * water lift, spin and carry them once it is deep enough. Each car is drawn as two boxes, a body
 * and a cabin, placed from that buffer.
 */
export function createCars(root: TgpuRoot, pool: meshPool.MeshPool, water: Water, debris: Debris) {
  const cars = root.createBuffer(carSlots).$usage("storage");
  const carsOut = cars.as("mutable");
  /** Only the drawing reads this view: a kernel may not bind one buffer both ways at once. */
  const carsIn = cars.as("readonly");
  const drive = root.createUniform(Drive, { dt: 0, time: 0, spawning: 1 });

  const step = createStep(root, { carsOut, drive, water, debris });
  const mesh = createMesh(root, pool, { carsIn });

  const empty = () => new Array(CARS).fill(undefined).map(() => Car());
  cars.write(empty());

  return {
    renderer: mesh.renderer,
    initAsync: () => pipelines.compile([step.pipeline]),

    /** Sets the step length and whether new cars may enter, once a frame before the steps. */
    prepare(dt: number, time: number, spawning: boolean) {
      drive.write({ dt, time, spawning: spawning ? 1 : 0 });
    },

    step(pass: TgpuComputePass) {
      step.step(pass);
    },

    /** Clears the roads; new cars drive in over the next seconds. */
    reset() {
      cars.write(empty());
    },

    destroy() {
      mesh.destroy();
      cars.destroy();
    },
  };
}
