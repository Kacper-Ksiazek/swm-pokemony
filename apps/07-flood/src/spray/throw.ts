import { Particle, type Particles } from "@typegpu/kit";
import { randf } from "@typegpu/noise";
import type { TgpuComputePass, TgpuRoot } from "typegpu";
import { d, tgpu } from "typegpu";

import { CELLS } from "@/world/layout";

/** Water slower than this into a wall raises no spray, in metres per second. */
const CALM = 2.5;
/** Chance per frame and per metre per second above calm that a struck cell throws a droplet. */
const RATE = 0.0035;
const WORKGROUP = 8;

export type Water = {
  readonly impactAt: (column: number, row: number) => d.v4f;
  readonly currentAt: (place: d.v2f) => d.v2f;
};

/**
 * The compute pass for the spray. A cell the water runs hard into can throw a droplet up and
 * back; `spawn`, `step`, and `compact` move the drops already in the air.
 */
export function createThrow(root: TgpuRoot, drops: Particles, water: Water) {
  const { impactAt, currentAt } = water;

  const clock = root.createUniform(d.f32, 0);

  const throwDrops = tgpu.computeFn({
    workgroupSize: [WORKGROUP, WORKGROUP],
    in: { id: d.builtin.globalInvocationId },
  })(({ id }) => {
    "use gpu";
    if (id.x >= CELLS || id.y >= CELLS) {
      return;
    }

    const impact = impactAt(d.i32(id.x), d.i32(id.y));
    if (impact.w <= CALM) {
      return;
    }

    randf.seed3(d.vec3f(d.vec2f(id.xy), clock.$));
    if (randf.sample() > (impact.w - CALM) * RATE) {
      return;
    }

    const flow = currentAt(impact.xz);
    const toss = d.vec3f(
      -flow.x * 0.3 + (randf.sample() - 0.5) * 3,
      impact.w * 0.9 + randf.sample() * 3,
      -flow.y * 0.3 + (randf.sample() - 0.5) * 3,
    );
    drops.emit(
      Particle({
        position: impact.xyz + d.vec3f(0, 0.2, 0),
        age: 0,
        velocity: toss,
        life: 1 + randf.sample() * 0.8,
        color: d.vec4f(0.92, 0.94, 0.95, 0.75),
        size: 0.35 + randf.sample() * 0.5,
        seed: randf.sample(),
      }),
    );
  });
  const throwing = root.createComputePipeline({ compute: throwDrops });
  const groups = Math.ceil(CELLS / WORKGROUP);
  let time = 0;

  return {
    throwing,

    /** Throws this frame's droplets, after the water has moved. */
    throw(pass: TgpuComputePass, dt: number) {
      time += dt;
      clock.write(time);
      pass.setPipeline(throwing);
      pass.dispatchWorkgroups(groups, groups);
    },

    spawn(pass: TgpuComputePass) {
      drops.spawn(pass);
    },

    step(pass: TgpuComputePass) {
      drops.step(pass);
    },

    compact(pass: TgpuComputePass, ahead: number) {
      drops.compact(pass, ahead);
    },
  };
}
