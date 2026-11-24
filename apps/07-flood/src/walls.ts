import { instances, type meshPool } from "@typegpu/kit";
import { meshes } from "@typegpu/kit/geometry";
import type { TgpuRoot } from "typegpu";

import { FALL_SECONDS, type Fall } from "@/world/collapse";
import { lengthOf, PANELS, THICKNESS, WALL_RUBBLE, type Panel, type Wall } from "@/world/walls";

const CONCRETE = [0.58, 0.58, 0.56] as const;
const BROKEN = [0.46, 0.45, 0.42] as const;
/** The wall being drawn, and a wall the pointer would remove. */
const DRAFT = [0.35, 0.55, 0.85] as const;
const DOOMED = [0.8, 0.25, 0.2] as const;
/** How far a section leans before it lies broken, in radians. */
const TOPPLE = 1.2;

const HIDDEN = { position: [0, -100, 0], scale: [0, 0, 0] } as const;

const mix = (a: number, b: number, t: number) => a + (b - a) * t;

/**
 * Where a box stands so it spans a stretch of wall from its footing to its top. Where the stretch
 * ends a whole wall, it reaches past its point by half the thickness, so walls that meet close
 * the corner.
 */
function placementOf(
  from: readonly [number, number],
  to: readonly [number, number],
  base: number,
  top: number,
  ends: readonly [boolean, boolean] = [true, true],
) {
  const [ax, az] = from;
  const [bx, bz] = to;
  const length = lengthOf(from, to);
  const yaw = Math.atan2(bx - ax, bz - az);
  const along = length === 0 ? [0, 0] : [(bx - ax) / length, (bz - az) / length];
  const before = ends[0] ? THICKNESS / 2 : 0;
  const after = ends[1] ? THICKNESS / 2 : 0;
  const shift = (after - before) / 2;
  const height = top - base;
  return {
    position: [
      (ax + bx) / 2 + along[0] * shift,
      base + height / 2,
      (az + bz) / 2 + along[1] * shift,
    ] as const,
    rotation: [0, Math.sin(yaw / 2), 0, Math.cos(yaw / 2)] as const,
    scale: [THICKNESS, height, length + before + after + 0.02] as const,
  };
}

/** Concrete flood walls, one box per section, so a breach shows as sections lying broken. */
export function createWalls(root: TgpuRoot, pool: meshPool.MeshPool) {
  const box = pool.add(meshes.box());
  const blocks = instances.create(root, pool, { capacity: PANELS + 1 });
  const draft = blocks.add(box, { ...HIDDEN, color: DRAFT, roughness: 0.5 });
  const rows = new Map<number, instances.Id>();
  const panels = new Map<number, Panel>();
  const settled = new Set<number>();
  let marked: number | undefined;

  const paint = (wall: number | undefined, color: readonly [number, number, number]) => {
    if (wall === undefined) return;
    for (const panel of panels.values()) {
      const row = rows.get(panel.slot);
      if (panel.wall === wall && row !== undefined && !settled.has(panel.slot)) {
        blocks.write(row, { color });
      }
    }
  };

  return {
    renderer: blocks.renderer(),

    /** Shows the wall being drawn, or hides it. */
    preview(wall: Wall | undefined) {
      blocks.write(draft, wall ? placementOf(wall.from, wall.to, wall.base, wall.top) : HIDDEN);
    },

    add(panel: Panel) {
      panels.set(panel.slot, panel);
      const placed = placementOf(panel.from, panel.to, panel.base, panel.top, panel.ends);
      rows.set(panel.slot, blocks.add(box, { ...placed, color: CONCRETE, roughness: 0.85 }));
    },

    remove(slot: number) {
      const row = rows.get(slot);
      if (row !== undefined) blocks.remove(row);
      rows.delete(slot);
      panels.delete(slot);
      settled.delete(slot);
    },

    /** Tints the wall the pointer would remove, and returns the others to concrete. */
    mark(wall: number | undefined) {
      if (marked === wall) return;
      paint(marked, CONCRETE);
      paint(wall, DOOMED);
      marked = wall;
    },

    /**
     * Topples each breaking section away from the water: it tips over about its foot on the dry
     * side and ends as a low slab of broken concrete.
     */
    update(falls: readonly (Fall | undefined)[], time: number) {
      for (const panel of panels.values()) {
        const fall = falls[panel.slot];
        const row = rows.get(panel.slot);
        if (!fall || row === undefined || settled.has(panel.slot)) continue;
        const t = Math.min(Math.max((time - fall.since) / FALL_SECONDS, 0), 1);
        const p = t * t;
        const placed = placementOf(panel.from, panel.to, panel.base, panel.top, panel.ends);
        // The side the water pushed it toward, across the wall
        const [ax, az] = panel.from;
        const [bx, bz] = panel.to;
        const length = Math.max(lengthOf(panel.from, panel.to), 1e-6);
        let across: [number, number] = [(bz - az) / length, -(bx - ax) / length];
        if (across[0] * fall.toward[0] + across[1] * fall.toward[1] < 0) {
          across = [-across[0], -across[1]];
        }
        const height = mix(panel.top - panel.base, WALL_RUBBLE + 0.5, p);
        const lean = TOPPLE * p;
        const yaw = Math.atan2(bx - ax, bz - az);
        // Yaw along the wall, then a turn about the wall's own length toward the dry side
        const half = lean / 2;
        const yawQ = [0, Math.sin(yaw / 2), 0, Math.cos(yaw / 2)];
        const side = across[0] * Math.cos(yaw) - across[1] * Math.sin(yaw) > 0 ? -1 : 1;
        const tipQ = [0, 0, side * Math.sin(half), Math.cos(half)];
        const rotation = [
          yawQ[3] * tipQ[0] + yawQ[0] * tipQ[3] + yawQ[1] * tipQ[2] - yawQ[2] * tipQ[1],
          yawQ[3] * tipQ[1] - yawQ[0] * tipQ[2] + yawQ[1] * tipQ[3] + yawQ[2] * tipQ[0],
          yawQ[3] * tipQ[2] + yawQ[0] * tipQ[1] - yawQ[1] * tipQ[0] + yawQ[2] * tipQ[3],
          yawQ[3] * tipQ[3] - yawQ[0] * tipQ[0] - yawQ[1] * tipQ[1] - yawQ[2] * tipQ[2],
        ] as const;
        const shift = Math.sin(lean) * height * 0.5;
        blocks.write(row, {
          position: [
            placed.position[0] + across[0] * shift,
            panel.base + height / 2,
            placed.position[2] + across[1] * shift,
          ],
          rotation,
          scale: [THICKNESS, height, placed.scale[2]],
          color: [
            mix(CONCRETE[0], BROKEN[0], p),
            mix(CONCRETE[1], BROKEN[1], p),
            mix(CONCRETE[2], BROKEN[2], p),
          ],
        });
        if (t >= 1) settled.add(panel.slot);
      }
      blocks.flush();
    },

    /** Stands every section of every wall up again. */
    restore() {
      settled.clear();
      for (const panel of panels.values()) {
        const row = rows.get(panel.slot);
        if (row === undefined) continue;
        const placed = placementOf(panel.from, panel.to, panel.base, panel.top, panel.ends);
        blocks.write(row, { ...placed, color: CONCRETE });
      }
    },

    destroy() {
      blocks.destroy();
    },
  };
}
