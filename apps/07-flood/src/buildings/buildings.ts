import { instances, type meshPool } from "@typegpu/kit";
import { meshes } from "@typegpu/kit/geometry";
import type { TgpuRoot } from "typegpu";

import { FALL_SECONDS, RUBBLE, type Fall } from "@/world/collapse";
import type { Building, Part } from "@/world/layout";

import { createDraw, Evening } from "./draw";
import { DUST, LEAN, mix, multiply, rotate, SPREAD, turnOf, type Quaternion } from "./pose";

/**
 * The town's buildings, each drawn as its parts: walls, roofs, cornices, tiers and masts. Windows
 * are painted onto the walls in the shader, in rows by storey, and at dusk some of them light up.
 * A falling building tips and crumbles as one, every part with it.
 */
export function createBuildings(
  root: TgpuRoot,
  pool: meshPool.MeshPool,
  buildings: readonly Building[],
) {
  const evening = root.createUniform(Evening, { lit: 0, glow: 0 });
  const Facade = createDraw(evening);

  const box = pool.add(meshes.box());
  const blocks = instances.create(root, pool, {
    kind: Facade,
    capacity: buildings.reduce((sum, building) => sum + building.parts.length, 0),
  });
  /** Buildings whose fall has run to the end, which need no more writes. */
  const settled = new Set<number>();

  const placed = (building: Building, part: Part) => ({
    position: [building.x + part.x, building.base + part.y, building.z + part.z] as const,
    rotation: turnOf(part),
    scale: [part.width, part.height, part.depth] as const,
  });

  const rows = buildings.map((building, index) =>
    building.parts.map((part) =>
      blocks.add(box, {
        ...placed(building, part),
        color: part.color,
        roughness: 0.85,
        windows: part.windows,
        storey: part.storey,
        bottom: building.base + part.y - part.height / 2,
        seed: index + 1,
        ruined: 0,
      }),
    ),
  );
  blocks.flush();

  return {
    renderer: blocks.renderer(),
    evening,

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

        const squash = mix(1, RUBBLE / building.height, p);
        const angle = LEAN * Math.sin(t * Math.PI * 0.5) * (1 - p * 0.6);
        const half = Math.sin(angle / 2);
        // A turn about the horizontal axis across the push, so the top tips toward it
        const lean: Quaternion = [z * half, 0, -x * half, Math.cos(angle / 2)];
        const shift = p * building.height * 0.25;
        const grow = 1 + SPREAD * p;
        const dust = p * 0.8;

        building.parts.forEach((part, j) => {
          const offset = rotate(lean, [part.x * grow, part.y * squash, part.z * grow]);
          blocks.write(rows[i][j], {
            position: [
              building.x + x * shift + offset[0],
              building.base + offset[1],
              building.z + z * shift + offset[2],
            ],
            rotation: multiply(lean, turnOf(part)),
            scale: [part.width * grow, Math.max(part.height * squash, 0.2), part.depth * grow],
            color: [
              mix(part.color[0], DUST[0], dust),
              mix(part.color[1], DUST[1], dust),
              mix(part.color[2], DUST[2], dust),
            ],
            ruined: 1,
          });
        });

        if (t >= 1) settled.add(i);
      }
      blocks.flush();
    },

    /** Stands every building up again. */
    reset() {
      settled.clear();
      buildings.forEach((building, i) =>
        building.parts.forEach((part, j) =>
          blocks.write(rows[i][j], { ...placed(building, part), color: part.color, ruined: 0 }),
        ),
      );
      blocks.flush();
    },

    destroy() {
      blocks.destroy();
    },
  };
}
