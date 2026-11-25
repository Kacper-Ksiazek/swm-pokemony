import { Particle } from "@typegpu/kit";
import type { TgpuRoot } from "typegpu";
import { d, std } from "typegpu";

/**
 * The droplet the camera sees: a soft white disc, as bright as the light around it, fading to
 * its rim and as it ages.
 */
export function createDraw(root: TgpuRoot) {
  /** How much daylight there is to light the spray, from 1 at noon to near 0 at night. */
  const daylight = root.createUniform(d.f32, 1);

  /** A soft white droplet, as bright as the light around it. */
  const droplet = (drop: Particle, local: d.v2f) => {
    "use gpu";
    const fall = std.saturate(1 - std.dot(local, local));
    const alpha = fall * drop.color.w * (1 - drop.age / drop.life);

    return d.vec4f(drop.color.xyz * (alpha * daylight.$), alpha);
  };

  return {
    shade: droplet,

    /** Sets how much daylight lights the spray, from 1 at noon to near 0 at night. */
    setDaylight(amount: number) {
      daylight.write(amount);
    },
  };
}
