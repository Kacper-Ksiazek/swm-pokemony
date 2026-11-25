import type { TgpuComputePass, TgpuMutable, TgpuReadonly, TgpuRoot, TgpuUniform } from "typegpu";
import { d, std, tgpu } from "typegpu";

import { CELL, CELLS } from "@/world/layout";

import { DRY, GRAVITY, indexOf, inside, Sim, WORKGROUP } from "./grid";
import type { Cells, Vec2Cells, Vec4Cells } from "./grid";

/** Share of each pipe's flow kept from the step before: about 5% lost per simulated second. */
const KEEP = 0.9998;
/**
 * How far each pipe's flow moves toward the same pipe in the neighbouring cells per step. This
 * eddy viscosity smooths the grid-sized crinkles fast water raises in narrow streets.
 */
const VISCOSITY = 0.04;
/** Manning roughness of streets and lawns, which slows thin, fast water the most. */
const ROUGHNESS = 0.035;

/** Rows along the sea edge whose surface follows the sea level. */
const SOURCE_ROWS = 3;
/** Fastest water the simulation allows, in metres per second. */
const TOP_SPEED = 16;

/**
 * The virtual-pipes tick. Each step speeds the four outflows up from the surface drop, then
 * moves water along them. Two flux copies mean a cell never reads a neighbour's half-written step.
 */
export function createStep(
  root: TgpuRoot,
  input: {
    readonly fluxRead: readonly [TgpuReadonly<Vec4Cells>, TgpuReadonly<Vec4Cells>];
    readonly fluxWrite: readonly [TgpuMutable<Vec4Cells>, TgpuMutable<Vec4Cells>];
    readonly depthIn: TgpuReadonly<Cells>;
    readonly depthOut: TgpuMutable<Cells>;
    readonly velocityOut: TgpuMutable<Vec2Cells>;
    readonly groundIn: TgpuReadonly<Cells>;
    readonly solidIn: TgpuReadonly<Cells>;
    readonly sim: TgpuUniform<typeof Sim>;
  },
) {
  const { depthIn, depthOut, velocityOut, groundIn, solidIn, sim } = input;

  const floorOf = (index: number) => {
    "use gpu";
    return groundIn.$[index] + solidIn.$[index];
  };

  /**
   * Speeds up each pipe by the surface drop towards its neighbour, spreads it toward the same
   * pipe next door, slows it on the ground, then caps it at the water the cell holds. Reads last
   * step's flux from one copy and writes the other, so neighbours never see a half-written step.
   */
  const accelerateFrom = (before: 0 | 1) => {
    const from = input.fluxRead[before];
    const to = input.fluxWrite[before === 0 ? 1 : 0];

    const levelOf = (column: number, row: number, fallback: number) => {
      "use gpu";
      if (!inside(column, row)) {
        return fallback;
      }
      const index = indexOf(column, row);

      return floorOf(index) + depthIn.$[index];
    };

    const pipesOf = (column: number, row: number, fallback: d.v4f) => {
      "use gpu";
      if (!inside(column, row)) {
        return d.vec4f(fallback);
      }

      return d.vec4f(from.$[indexOf(column, row)]);
    };

    return tgpu.computeFn({
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
      const level = floorOf(index) + water;
      const dt = sim.$.dt;

      // Past the land edges the ground falls away, so water runs off the map instead of piling
      // up against it. The sea's sides are closed, so the wave keeps its shape along them
      const floor = floorOf(index);
      const beyond = std.select(level, floor, floor >= 0);
      const drop =
        d.vec4f(level) -
        d.vec4f(
          levelOf(column - 1, row, beyond),
          levelOf(column + 1, row, beyond),
          levelOf(column, row - 1, level),
          levelOf(column, row + 1, beyond),
        );
      const own = d.vec4f(from.$[index]);
      const around =
        (pipesOf(column - 1, row, own) +
          pipesOf(column + 1, row, own) +
          pipesOf(column, row - 1, own) +
          pipesOf(column, row + 1, own)) *
        0.25;
      let out = own * KEEP + (around - own) * VISCOSITY + drop * (dt * GRAVITY * water);
      out = std.max(d.vec4f(0), out);

      // Manning friction: the thinner and faster the water, the harder the ground holds it back
      const deep = std.max(water, DRY);
      const speed = out / (CELL * deep);
      const drag = (dt * GRAVITY * ROUGHNESS * ROUGHNESS) / std.pow(deep, 4 / 3);
      out = out / (d.vec4f(1) + speed * drag);

      const leaving = (out.x + out.y + out.z + out.w) * dt;
      const held = water * CELL * CELL;
      if (leaving > held) {
        out = out * (held / leaving);
      }
      to.$[index] = d.vec4f(out);
    });
  };

  /** Moves water along the pipes, then measures how fast it flows through the cell. */
  const moveWith = (copy: 0 | 1) => {
    const flux = input.fluxRead[copy];

    const inflowFrom = (column: number, row: number, pipe: number) => {
      "use gpu";
      if (!inside(column, row)) {
        return d.f32(0);
      }
      return flux.$[indexOf(column, row)][pipe];
    };

    return tgpu.computeFn({
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
      const out = flux.$[index];
      const fromLeft = inflowFrom(column - 1, row, 1);
      const fromRight = inflowFrom(column + 1, row, 0);
      const fromBack = inflowFrom(column, row - 1, 3);
      const fromFront = inflowFrom(column, row + 1, 2);

      const dt = sim.$.dt;
      const before = depthOut.$[index];
      const gained = fromLeft + fromRight + fromBack + fromFront - (out.x + out.y + out.z + out.w);
      let after = std.max(before + (gained * dt) / (CELL * CELL), 0);

      // The sea edge holds the sea level, so raising it sends a wave inland
      if (row < SOURCE_ROWS) {
        after = std.max(sim.$.sea - floorOf(index), 0);
      }
      depthOut.$[index] = after;

      const mean = std.max((before + after) / 2, 0.05);
      const across = (fromLeft - out.x + out.y - fromRight) / 2;
      const along = (fromBack - out.z + out.w - fromFront) / 2;
      const flow = d.vec2f(across, along) / (CELL * mean);
      const speed = std.length(flow);
      velocityOut.$[index] = flow * std.min(1, TOP_SPEED / std.max(speed, 0.0001));
    });
  };

  const stepping = ([0, 1] as const).map((copy) => ({
    accelerate: root.createComputePipeline({ compute: accelerateFrom(copy) }),
    move: root.createComputePipeline({ compute: moveWith(copy === 0 ? 1 : 0) }),
  }));
  const groups = Math.ceil(CELLS / WORKGROUP);
  let parity = 0;

  return {
    pipelines: stepping.flatMap((step) => [step.accelerate, step.move]),

    /** Records one simulation step into an open compute pass. */
    step(pass: TgpuComputePass) {
      const step = stepping[parity];
      pass.setPipeline(step.accelerate);
      pass.dispatchWorkgroups(groups, groups);
      pass.setPipeline(step.move);
      pass.dispatchWorkgroups(groups, groups);
      parity = 1 - parity;
    },

    /** The next step reads the copy a calm sea was written into. */
    reset() {
      parity = 0;
    },
  };
}
