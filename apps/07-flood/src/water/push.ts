import { readback } from "@typegpu/kit";
import type { Frame } from "@typegpu/kit";
import type { TgpuComputePass, TgpuReadonly, TgpuRoot } from "typegpu";
import { d, std, tgpu } from "typegpu";

import { CELL, CELLS } from "@/world/layout";

import { GRAVITY, indexOf, inside, PUSH_RATE, WORKGROUP } from "./grid";
import type { Cells, Owners, Vec2Cells } from "./grid";

/** Fixed-point units per kilonewton, since atomics add only integers. */
const PUSH_UNITS = 64;
/** Water density in tonnes per cubic metre, so pressures come out in kilopascals. */
const DENSITY = 1;

/**
 * Adds each wet cell's force onto the building or wall beside it. Walls also take the weight of
 * water standing against them, because the ground behind a wall is dry.
 */
export function createPush(
  root: TgpuRoot,
  input: {
    readonly depthIn: TgpuReadonly<Cells>;
    readonly velocityIn: TgpuReadonly<Vec2Cells>;
    readonly ownerIn: TgpuReadonly<Owners>;
    readonly buildingCount: number;
    readonly walls: number;
  },
) {
  const { depthIn, velocityIn, ownerIn, buildingCount, walls } = input;
  const slots = Math.max(buildingCount + walls, 1);
  const Push = d.struct({ x: d.atomic(d.i32), z: d.atomic(d.i32) });
  const push = root.createBuffer(d.arrayOf(Push, slots)).$usage("storage");
  const pushOut = push.as("mutable");
  const nothing = new Array(slots).fill({ x: 0, z: 0 });
  const pushes = new Float32Array(slots * 2);
  const pushProbe = readback.create(root, push, {
    bytes: true,
    hz: PUSH_RATE,
    decode: (bytes) => {
      const units = new Int32Array(bytes);
      for (let i = 0; i < pushes.length; i++) pushes[i] = units[i] / PUSH_UNITS;
      return pushes;
    },
  });

  /**
   * Adds the push of each wet cell on the buildings beside it. Water running into a wall stops
   * there, so the wall takes its dynamic pressure, half rho v squared, over the wet height of
   * one cell's width. The pushes add up into a force on the whole building, in kilonewtons.
   */
  const press = tgpu.computeFn({
    workgroupSize: [WORKGROUP, WORKGROUP],
    in: { id: d.builtin.globalInvocationId },
  })(({ id }) => {
    "use gpu";
    if (id.x >= CELLS || id.y >= CELLS) {
      return;
    }

    const column = d.i32(id.x);
    const row = d.i32(id.y);
    const index = indexOf(column, row);
    const water = depthIn.$[index];

    if (ownerIn.$[index] !== 0 || water < 0.05) {
      return;
    }

    const flow = velocityIn.$[index];
    for (const offset of tgpu.unroll([
      d.vec2i(-1, 0),
      d.vec2i(1, 0),
      d.vec2i(0, -1),
      d.vec2i(0, 1),
    ])) {
      const next = d.vec2i(column, row) + offset;
      if (inside(next.x, next.y)) {
        const building = ownerIn.$[indexOf(next.x, next.y)];
        if (building !== 0) {
          const toward = d.vec2f(offset);
          const into = std.max(std.dot(flow, toward), 0);
          let force = 0.5 * DENSITY * into * into * water * CELL;

          // A wall also takes the weight of the water standing against it, half rho g h squared:
          // it has dry ground behind it, where a building has water on every side
          if (building > buildingCount) {
            force += 0.5 * DENSITY * GRAVITY * water * water * CELL;
          }
          const units = d.vec2i(toward * (force * PUSH_UNITS));
          std.atomicAdd(pushOut.$[building - 1].x, units.x);
          std.atomicAdd(pushOut.$[building - 1].z, units.y);
        }
      }
    }
  });
  const pressing = root.createComputePipeline({ compute: press });
  const groups = Math.ceil(CELLS / WORKGROUP);

  return {
    pressing,

    /** Clears last frame's forces, then adds this frame's. */
    record(pass: TgpuComputePass) {
      push.write(nothing);
      pass.setPipeline(pressing);
      pass.dispatchWorkgroups(groups, groups);
    },

    /** Copies the push on every building toward the CPU, after the pass that painted ends. */
    capture(frame: Frame) {
      pushProbe.capture(frame);
    },

    /** The latest push on every building in kilonewtons, as x and z pairs, once it arrives. */
    get pushes() {
      return pushProbe.latest;
    },

    reset() {
      pushProbe.reset();
    },

    destroy() {
      pushProbe.destroy();
      push.destroy();
    },
  };
}
