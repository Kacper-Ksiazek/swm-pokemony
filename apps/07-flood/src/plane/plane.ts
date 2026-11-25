import type { meshPool } from "@typegpu/kit";
import type { TgpuRoot } from "typegpu";

import type { Sans } from "@/fonts";

import { createAirframe } from "./airframe";
import { createBanner } from "./banner";
import { createFlight, Flight } from "./flight";

/**
 * A light plane that circles the town towing a banner with the kit's name on it. The banner
 * trails along the flight path and ripples in the wind; the letters are the kit's own text,
 * laid onto the cloth by a placing function so they ripple with it.
 */
export function createPlane(root: TgpuRoot, pool: meshPool.MeshPool, sans: Sans) {
  const flight = root.createUniform(Flight, { angle: 0, time: 0 });
  const banner = createBanner(root, sans, flight);
  const { parts, rows, towline } = createAirframe(root, pool);
  const motion = createFlight({ flight, parts, rows, towline });

  return {
    /** The banner cloth, opaque, and its letters, which blend over it: add them in this order. */
    cloth: banner.cloth,
    letters: banner.letters,

    /** Flies the plane on by `dt` seconds of real time. */
    update: motion.update,

    renderer: parts.renderer(),

    /** Where the plane is now, in world space. */
    get position() {
      return motion.position;
    },

    destroy() {
      parts.destroy();
      banner.destroy();
    },
  };
}
