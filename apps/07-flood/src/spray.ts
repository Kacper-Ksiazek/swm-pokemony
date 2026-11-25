import { Particle, particles, pipelines, type cameras } from "@typegpu/kit";
import { randf } from "@typegpu/noise";
import { d, std, tgpu, type TgpuComputePass, type TgpuRoot } from "typegpu";

import { CELLS } from "@/world/layout";

/** Droplets alive at once. */
const CAPACITY = 8000;
/** Water slower than this into a wall raises no spray, in metres per second. */
const CALM = 2.5;
/** Chance per frame and per metre per second above calm that a struck cell throws a droplet. */
const RATE = 0.0035;
const WORKGROUP = 8;

type Water = {
  readonly impactAt: (column: number, row: number) => d.v4f;
  readonly currentAt: (place: d.v2f) => d.v2f;
};

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
  const { impactAt, currentAt } = water;
  /** How much daylight there is to light the spray, from 1 at noon to near 0 at night. */
  const daylight = root.createUniform(d.f32, 1);
  /** A soft white droplet, as bright as the light around it. */
  const droplet = (drop: Particle, local: d.v2f) => {
    "use gpu";
    const fall = std.saturate(1 - std.dot(local, local));
    const alpha = fall * drop.color.w * (1 - drop.age / drop.life);
    return d.vec4f(drop.color.xyz * (alpha * daylight.$), alpha);
  };
  const drops = particles.create(root, view, {
    capacity: CAPACITY,
    step: options.step,
    label: "spray",
    blend: "over",
    shade: droplet,
    settings: { gravity: [0, -9.81, 0], drag: 0.9 },
  });
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
    drawing: drops.drawing,

    /** Sets how much daylight lights the spray, from 1 at noon to near 0 at night. */
    setDaylight(amount: number) {
      daylight.write(amount);
    },
    initAsync: () => Promise.all([drops.initAsync(), pipelines.compile([throwing])]),

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

    clear(encoder: Parameters<typeof drops.clear>[0]) {
      drops.clear(encoder);
    },

    destroy() {
      drops.destroy();
    },
  };
}
