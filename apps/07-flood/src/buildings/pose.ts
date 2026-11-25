import type { Part } from "@/world/layout";

/** Colour a fallen building takes under its own dust. */
export const DUST = [0.42, 0.39, 0.35] as const;
/** How far a building leans toward the push before it has crumbled, in radians. */
export const LEAN = 0.45;
/** How much wider than the building its heap spreads. */
export const SPREAD = 0.35;

export const mix = (a: number, b: number, t: number) => a + (b - a) * t;

export type Quaternion = readonly [number, number, number, number];
const IDENTITY: Quaternion = [0, 0, 0, 1];

export const multiply = (a: Quaternion, b: Quaternion): Quaternion => [
  a[3] * b[0] + a[0] * b[3] + a[1] * b[2] - a[2] * b[1],
  a[3] * b[1] - a[0] * b[2] + a[1] * b[3] + a[2] * b[0],
  a[3] * b[2] + a[0] * b[1] - a[1] * b[0] + a[2] * b[3],
  a[3] * b[3] - a[0] * b[0] - a[1] * b[1] - a[2] * b[2],
];

export const rotate = (q: Quaternion, [x, y, z]: readonly [number, number, number]) => {
  // v + 2 w (u x v) + 2 u x (u x v)
  const [ux, uy, uz, w] = q;
  const cx = uy * z - uz * y;
  const cy = uz * x - ux * z;
  const cz = ux * y - uy * x;

  return [
    x + 2 * (w * cx + uy * cz - uz * cy),
    y + 2 * (w * cy + uz * cx - ux * cz),
    z + 2 * (w * cz + ux * cy - uy * cx),
  ] as const;
};

/** A gable roof is a box turned 45 degrees about its ridge, its lower half inside the walls. */
export const turnOf = (part: Part): Quaternion => {
  const half = Math.sin(Math.PI / 8);
  const whole = Math.cos(Math.PI / 8);

  if (part.ridge === "z") return [0, 0, half, whole];
  if (part.ridge === "x") return [half, 0, 0, whole];

  return IDENTITY;
};
