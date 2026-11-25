import { instances, type meshPool } from "@typegpu/kit";
import { meshes } from "@typegpu/kit/geometry";
import type { TgpuRoot } from "typegpu";

import { type Piece, type Vec3 } from "@/world/beach";

const WHITE: readonly [number, number, number] = [0.94, 0.94, 0.92];
const TRIM: readonly [number, number, number] = [0.2, 0.78, 0.86];
const DARK: readonly [number, number, number] = [0.12, 0.13, 0.15];

const piece = (offset: Vec3, size: Vec3, color: Piece["color"]): Piece => ({
  offset,
  rotation: [0, 0, 0, 1],
  size,
  color,
  glow: [0, 0, 0],
});

/** A small high-wing plane, nose toward +z. */
export const AIRFRAME: Piece[] = [
  piece([0, 0, 0], [1.3, 1.3, 7], WHITE),
  piece([0, 0.75, 0.6], [11, 0.2, 1.7], WHITE),
  piece([0, 0.75, 0.6], [11.04, 0.22, 0.35], TRIM),
  piece([0, 0.2, -3.2], [3.6, 0.16, 1.1], WHITE),
  piece([0, 0.95, -3.3], [0.16, 1.6, 1.2], TRIM),
  piece([0, 0.35, 1.8], [1.1, 0.6, 1.4], DARK),
  piece([0, 0, 3.7], [0.5, 0.5, 0.5], DARK),
];
/** The propeller, turned about z each frame. */
export const PROPELLER = piece([0, 0, 3.95], [0.12, 2.4, 0.12], DARK);

export function createAirframe(root: TgpuRoot, pool: meshPool.MeshPool) {
  const box = pool.add(meshes.box());
  const parts = instances.create(root, pool, { capacity: AIRFRAME.length + 2 });
  const rows = [...AIRFRAME, PROPELLER].map((part) =>
    parts.add(box, { position: [0, -100, 0], scale: part.size, color: part.color, roughness: 0.4 }),
  );
  const towline = parts.add(box, { position: [0, -100, 0], scale: [0.05, 0.05, 1], color: DARK });

  return { parts, rows, towline };
}
