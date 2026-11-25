import type { Color } from "@/world/layout";

export type Vec3 = readonly [number, number, number];
export type Quaternion = readonly [number, number, number, number];

/** A box placed relative to something: its centre, its turn and its size. */
export type Piece = {
  readonly offset: Vec3;
  readonly rotation: Quaternion;
  readonly size: Vec3;
  readonly color: Color;
  /** Light it gives off at night, multiplied by the evening's glow; zero for none. */
  readonly glow: Color;
};

export const IDENTITY: Quaternion = [0, 0, 0, 1];

export const turnAbout = (axis: Vec3, angle: number): Quaternion => {
  const s = Math.sin(angle / 2);

  return [axis[0] * s, axis[1] * s, axis[2] * s, Math.cos(angle / 2)];
};

export const multiply = (a: Quaternion, b: Quaternion): Quaternion => [
  a[3] * b[0] + a[0] * b[3] + a[1] * b[2] - a[2] * b[1],
  a[3] * b[1] - a[0] * b[2] + a[1] * b[3] + a[2] * b[0],
  a[3] * b[2] + a[0] * b[1] - a[1] * b[0] + a[2] * b[3],
  a[3] * b[3] - a[0] * b[0] - a[1] * b[1] - a[2] * b[2],
];

export const rotate = (q: Quaternion, [x, y, z]: Vec3): Vec3 => {
  const [ux, uy, uz, w] = q;
  const cx = uy * z - uz * y;
  const cy = uz * x - ux * z;
  const cz = ux * y - uy * x;

  return [
    x + 2 * (w * cx + uy * cz - uz * cy),
    y + 2 * (w * cy + uz * cx - ux * cz),
    z + 2 * (w * cz + ux * cy - uy * cx),
  ];
};

export const piece = (
  offset: Vec3,
  size: Vec3,
  color: Color,
  rotation: Quaternion = IDENTITY,
  glow: Color = [0, 0, 0],
): Piece => ({ offset, rotation, size, color, glow });
