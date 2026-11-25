import type { TgpuComputePass, TgpuMutable, TgpuReadonly, TgpuRoot, TgpuUniform } from "typegpu";
import { d, std, tgpu } from "typegpu";

import { CELL, CELLS } from "@/world/layout";

import { DRY, indexOf, inside, Look, WORKGROUP } from "./grid";
import type { Cells, Vec2Cells } from "./grid";

/** Seconds for foam to fade to a third. */
const FOAM_LIFE = 1.6;

/**
 * Once a frame, after the fixed steps: carries foam along the flow and writes the surface
 * texture the drawing and the other layers sample.
 */
export function createPicture(
  root: TgpuRoot,
  input: {
    readonly depthIn: TgpuReadonly<Cells>;
    readonly velocityIn: TgpuReadonly<Vec2Cells>;
    readonly foamBefore: TgpuReadonly<Cells>;
    readonly foamCarried: TgpuMutable<Cells>;
    readonly foamKept: TgpuMutable<Cells>;
    readonly foamIn: TgpuReadonly<Cells>;
    readonly groundIn: TgpuReadonly<Cells>;
    readonly solidIn: TgpuReadonly<Cells>;
    readonly look: TgpuUniform<typeof Look>;
  },
) {
  const {
    depthIn,
    velocityIn,
    foamBefore,
    foamCarried,
    foamKept,
    foamIn,
    groundIn,
    solidIn,
    look,
  } = input;

  const floorOf = (index: number) => {
    "use gpu";
    return groundIn.$[index] + solidIn.$[index];
  };

  /** Surface height, depth, speed and foam per cell, which the water drawing samples smoothly. */
  const picture = root
    .createTexture({ size: [CELLS, CELLS], format: "rgba16float" })
    .$usage("storage", "sampled");
  const pictureOut = picture.createView(d.textureStorage2d("rgba16float", "write-only"));
  const pictureIn = picture.createView(d.texture2d(d.f32));
  /** Water velocity per cell in metres per second, for ripples that drift with the current. */
  const currents = root
    .createTexture({ size: [CELLS, CELLS], format: "rgba16float" })
    .$usage("storage", "sampled");
  const currentsOut = currents.createView(d.textureStorage2d("rgba16float", "write-only"));
  const currentsIn = currents.createView(d.texture2d(d.f32));
  const smooth = root.createSampler({ magFilter: "linear", minFilter: "linear" });

  /** Foam at a point in cell units, blended from the four nearest cells. */
  const foamAt = (at: d.v2f) => {
    "use gpu";
    const kept = std.clamp(at, d.vec2f(0), d.vec2f(CELLS - 1.001));
    const corner = d.vec2i(std.floor(kept));
    const t = kept - std.floor(kept);
    const a = foamBefore.$[indexOf(corner.x, corner.y)];
    const b = foamBefore.$[indexOf(corner.x + 1, corner.y)];
    const c = foamBefore.$[indexOf(corner.x, corner.y + 1)];
    const e = foamBefore.$[indexOf(corner.x + 1, corner.y + 1)];
    return std.mix(std.mix(a, b, t.x), std.mix(c, e, t.x), t.y);
  };

  /**
   * Carries last frame's foam along the flow, fades it, and whips up more where the water runs
   * fast or its surface breaks steeply, as at the wave's front and behind each corner.
   */
  const churn = tgpu.computeFn({
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

    if (water < DRY) {
      foamCarried.$[index] = 0;
      return;
    }

    const flow = velocityIn.$[index];
    const dt = look.$.dt;
    const carried = foamAt(d.vec2f(id.xy) - (flow * dt) / CELL) * std.exp(-dt / FOAM_LIFE);

    const level = floorOf(index) + water;
    let steepest = d.f32(0);
    for (const offset of tgpu.unroll([
      d.vec2i(-1, 0),
      d.vec2i(1, 0),
      d.vec2i(0, -1),
      d.vec2i(0, 1),
    ])) {
      const next = d.vec2i(column, row) + offset;
      if (inside(next.x, next.y)) {
        const other = indexOf(next.x, next.y);
        if (depthIn.$[other] > DRY) {
          steepest = std.max(steepest, std.abs(floorOf(other) + depthIn.$[other] - level) / CELL);
        }
      }
    }

    const fast = std.smoothstep(4, 11, std.length(flow));
    const breaking = std.smoothstep(0.4, 1.2, steepest);
    const thin = std.smoothstep(0.6, 0.05, water) * std.smoothstep(1, 4, std.length(flow));
    const whipped = (fast * 0.25 + breaking * 0.9 + thin * 0.3) * dt;
    foamCarried.$[index] = std.saturate(carried + whipped);
  });

  /**
   * Writes the picture. Wet cells show their surface, softened toward wet neighbours so the
   * grid never shows. A dry cell next to water takes their level, but no higher than its own
   * floor, so the surface meets sloping ground at a real shoreline and slips inside walls.
   */
  const paint = tgpu.computeFn({
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
    const floor = floorOf(index);

    let sum = d.f32(0);
    let weight = d.f32(0);
    for (const offset of tgpu.unroll([
      d.vec2i(-1, -1),
      d.vec2i(0, -1),
      d.vec2i(1, -1),
      d.vec2i(-1, 0),
      d.vec2i(1, 0),
      d.vec2i(-1, 1),
      d.vec2i(0, 1),
      d.vec2i(1, 1),
    ])) {
      const next = d.vec2i(column, row) + offset;
      if (inside(next.x, next.y)) {
        const other = indexOf(next.x, next.y);
        if (depthIn.$[other] > DRY) {
          const near = 1 / std.length(d.vec2f(offset));
          sum += (floorOf(other) + depthIn.$[other]) * near;
          weight += near;
        }
      }
    }

    let level = groundIn.$[index] - 1;
    if (water > DRY) {
      level = floor + water;
      if (weight > 0) {
        level = std.mix(level, sum / weight, 0.35);
      }
    } else if (weight > 0) {
      level = std.min(sum / weight, floor);
    }

    const foam = foamIn.$[index];
    foamKept.$[index] = foam;
    const flow = velocityIn.$[index];
    std.textureStore(
      pictureOut.$,
      id.xy,
      d.vec4f(level, std.max(water, 0), std.length(flow), foam),
    );
    std.textureStore(currentsOut.$, id.xy, d.vec4f(flow, 0, 0));
  });

  const churning = root.createComputePipeline({ compute: churn });
  const painting = root.createComputePipeline({ compute: paint });
  const groups = Math.ceil(CELLS / WORKGROUP);

  return {
    picture,
    currents,
    pictureIn,
    currentsIn,
    smooth,
    pipelines: [churning, painting],

    /** Carries the foam, then writes the picture the drawing reads. */
    record(pass: TgpuComputePass) {
      pass.setPipeline(churning);
      pass.dispatchWorkgroups(groups, groups);
      pass.setPipeline(painting);
      pass.dispatchWorkgroups(groups, groups);
    },
  };
}
