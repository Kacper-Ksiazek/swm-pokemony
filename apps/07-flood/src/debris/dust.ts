import { srgbToLinear } from "@typegpu/color";
import { Particle, particles, type cameras } from "@typegpu/kit";
import { d, std, type TgpuRoot, type TgpuUniform } from "typegpu";

/** Dust puffs alive at once. */
const PUFFS = 1200;

/** Dust in daylight, already lit: its colour times the sun and sky it scatters. */
const DUST_LIT = std.mul(srgbToLinear(d.vec3f(0.66, 0.61, 0.54)), 1.8);

/** Dust puffs. They billow as they rise, then thin as they spread and age. */
export function createDust(
  root: TgpuRoot,
  view: cameras.CameraBase,
  daylight: TgpuUniform<typeof d.f32>,
  options: { step: number },
) {
  /** A soft puff of dust: it thins as it spreads and ages. */
  const puff = (dust: Particle, local: d.v2f) => {
    "use gpu";
    const fall = 1 - std.dot(local, local);

    if (fall <= 0) {
      return d.vec4f();
    }

    const age = dust.age / dust.life;
    const alpha = fall * fall * dust.color.w * (1 - age) * std.saturate(age * 8);

    // Dust scatters light every way, so one sunlit colour suits the whole puff: shading each
    // pixel of these large, overlapping quads would cost more than the rest of the debris
    return d.vec4f(DUST_LIT * (alpha * daylight.$), alpha);
  };

  /** Dust grows as it spreads. */
  const billow = (dust: Particle, dt: number) => {
    "use gpu";
    const next = Particle(dust);
    next.size = dust.size * (1 + 0.35 * dt);

    return next;
  };

  const dust = particles.create(root, view, {
    capacity: PUFFS,
    step: options.step,
    label: "dust",
    blend: "over",
    update: billow,
    shade: puff,
    settings: { gravity: [0, 0.4, 0], drag: 1.2 },
  });

  return dust;
}
