import { instances, type meshPool } from "@typegpu/kit";
import { meshes } from "@typegpu/kit/geometry";
import type { TgpuRoot } from "typegpu";

import { FALL_SECONDS, RUBBLE, type Fall } from "@/world/collapse";
import type { Building } from "@/world/layout";

/** Colour a fallen building takes under its own dust. */
const DUST = [0.42, 0.39, 0.35] as const;
/** How far a building leans toward the push before it has crumbled, in radians. */
const LEAN = 0.45;
/** How much wider than the building its heap spreads. */
const SPREAD = 0.35;

const mix = (a: number, b: number, t: number) => a + (b - a) * t;

/** One box per building, scaled to its footprint and height, that leans and sinks as it falls. */
export function createBuildings(
  root: TgpuRoot,
  pool: meshPool.MeshPool,
  buildings: readonly Building[],
) {
  const box = pool.add(meshes.box());
  const blocks = instances.create(root, pool, { capacity: buildings.length });
  /** Buildings whose fall has run to the end, which need no more writes. */
  const settled = new Set<number>();

  const standing = (building: Building) => ({
    position: [building.x, building.base + building.height / 2, building.z] as const,
    rotation: [0, 0, 0, 1] as const,
    scale: [building.width, building.height, building.depth] as const,
    color: building.color,
  });

  const ids = buildings.map((building) =>
    blocks.add(box, { ...standing(building), roughness: 0.8 }),
  );
  blocks.flush();

  return {
    renderer: blocks.renderer(),

    /**
     * Moves every falling building to where it is at `time`: it leans toward the push faster and
     * faster, while it crumbles down to a wide, low heap of dusty rubble.
     */
    update(falls: readonly (Fall | undefined)[], time: number) {
      for (let i = 0; i < buildings.length; i++) {
        const fall = falls[i];
        if (!fall || settled.has(i)) continue;
        const building = buildings[i];
        const t = Math.min(Math.max((time - fall.since) / FALL_SECONDS, 0), 1);
        const p = t * t;
        const [x, z] = fall.toward;

        const height = mix(building.height, RUBBLE, p);
        const angle = LEAN * Math.sin(t * Math.PI * 0.5) * (1 - p * 0.6);
        const half = Math.sin(angle / 2);
        const shift = p * building.height * 0.25;
        const grow = 1 + SPREAD * p;
        blocks.write(ids[i], {
          position: [building.x + x * shift, building.base + height / 2, building.z + z * shift],
          // A turn about the horizontal axis across the push, so the top tips toward it
          rotation: [z * half, 0, -x * half, Math.cos(angle / 2)],
          scale: [building.width * grow, height, building.depth * grow],
          color: [
            mix(building.color[0], DUST[0], p * 0.8),
            mix(building.color[1], DUST[1], p * 0.8),
            mix(building.color[2], DUST[2], p * 0.8),
          ],
        });
        if (t >= 1) settled.add(i);
      }
      blocks.flush();
    },

    /** Stands every building up again. */
    reset() {
      settled.clear();
      buildings.forEach((building, i) => blocks.write(ids[i], standing(building)));
      blocks.flush();
    },

    destroy() {
      blocks.destroy();
    },
  };
}
