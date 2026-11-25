import { instances, lighting, type meshPool, type table } from "@typegpu/kit";
import { meshes } from "@typegpu/kit/geometry";
import { type TgpuRoot, type TgpuUniform } from "typegpu";

import type { Evening } from "@/buildings";
import { type Beach, type Drift } from "@/world/beach";
import { type Fall } from "@/world/collapse";

import { createLights, defineLit } from "./lights";
import { createPoses } from "./poses";

/**
 * The beach's things: the pier on its piles with rails and neon, the lamps and their light, the
 * arch, and the palms. Palms sway in the breeze; spans and palms the flood overcomes fall.
 */
export function createBeachView(
  root: TgpuRoot,
  pool: meshPool.MeshPool,
  beach: Beach,
  evening: TgpuUniform<typeof Evening>,
  lamps: table.Table<typeof lighting.PointLight>,
) {
  const Lit = defineLit(evening);
  const count =
    beach.pieces.length +
    beach.posts.reduce((sum, post) => sum + post.pieces.length, 0) +
    beach.spans.reduce((sum, span) => sum + span.pieces.length, 0) +
    beach.palms.reduce((sum, palm) => sum + palm.pieces.length, 0) +
    beach.wheel.turning.length +
    beach.wheel.cars.length +
    beach.wheel.legs.length;
  const box = pool.add(meshes.box());
  const things = instances.create(root, pool, { kind: Lit, capacity: count });
  const lights = createLights(root, beach, lamps);
  const poses = createPoses({
    beach,
    things,
    box,
    lamps,
    lampRows: lights.lampRows,
    dark: lights.dark,
    sweep: lights.sweep,
  });

  return {
    renderer: things.renderer(),
    beams: lights.beams,

    /** Lights the lamps for how dark it is, from 0 by day to 1 at night. */
    setNight(amount: number) {
      lights.setNight(amount);
    },

    /**
     * Sways every standing palm in the breeze, and moves the spans and palms that are falling:
     * a span tips over and sinks under the water; a palm falls flat the way the water pushed it.
     */
    update(
      time: number,
      spanFalls: readonly (Fall | undefined)[],
      palmFalls: readonly (Fall | undefined)[],
      drift: readonly Drift[],
      postFalls: readonly (Fall | undefined)[],
    ) {
      poses.update(time, spanFalls, palmFalls, drift, postFalls);
      things.flush();
      lamps.flush();
    },

    /** Stands the pier and the palms up again and lights every lamp. */
    reset() {
      poses.reset();
      this.setNight(lights.night);
    },

    destroy() {
      things.destroy();
    },
  };
}
