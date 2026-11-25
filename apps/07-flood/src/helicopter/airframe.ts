import { instances, type meshPool } from "@typegpu/kit";
import { meshes } from "@typegpu/kit/geometry";
import type { TgpuRoot } from "typegpu";

import type { Piece, Vec3 } from "@/world/beach";

const RED: Piece["color"] = [0.82, 0.12, 0.1];
const WHITE: Piece["color"] = [0.93, 0.93, 0.9];
const DARK: Piece["color"] = [0.12, 0.13, 0.15];
const GLASS: Piece["color"] = [0.25, 0.35, 0.45];

const part = (
  offset: Vec3,
  size: Vec3,
  color: Piece["color"],
  glow: Piece["color"] = [0, 0, 0],
): Piece => ({
  offset,
  rotation: [0, 0, 0, 1],
  size,
  color,
  glow,
});

/** A rescue helicopter in red and white, nose toward +z. */
const AIRFRAME: Piece[] = [
  part([0, 0, 0], [2.2, 2, 4.6], RED),
  part([0, 0.3, 1.9], [1.9, 1.3, 1.2], GLASS),
  part([0, 0.25, -4.4], [0.5, 0.5, 5], WHITE),
  part([0, 1, -6.7], [0.15, 1.8, 1], RED),
  part([0, -1.25, 0], [0.12, 0.12, 4.4], DARK),
  part([0.9, -1.35, 0], [0.12, 0.12, 4.6], DARK),
  part([-0.9, -1.35, 0], [0.12, 0.12, 4.6], DARK),
  part([0, 1.2, 0], [0.4, 0.5, 0.4], DARK),
  part([0, -0.9, 2.2], [0.5, 0.4, 0.5], WHITE, [3, 3, 3.2]),
];
/** The main rotor's two blades and the tail rotor, turned each frame. */
const MAIN_ROTOR: Piece[] = [
  part([0, 1.5, 0], [10.5, 0.08, 0.35], DARK),
  part([0, 1.5, 0], [0.35, 0.08, 10.5], DARK),
];
const TAIL_ROTOR = part([0.3, 1, -6.7], [0.08, 1.8, 0.25], DARK);

/** The body and both rotors, as boxes hidden at the hangar until it is called out. */
export function createAirframe(root: TgpuRoot, pool: meshPool.MeshPool, hangar: Vec3) {
  const box = pool.add(meshes.box());
  const all = [...AIRFRAME, ...MAIN_ROTOR, TAIL_ROTOR];
  const parts = instances.create(root, pool, { capacity: all.length });
  const rows = all.map((piece) =>
    parts.add(box, {
      position: hangar,
      // Hidden until it is called out
      scale: [0, 0, 0],
      color: piece.color,
      emission: piece.glow,
      roughness: 0.4,
    }),
  );

  return { parts, rows, all, mainRotor: MAIN_ROTOR, tailRotor: TAIL_ROTOR };
}
