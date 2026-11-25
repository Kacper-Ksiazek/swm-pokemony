import { d, std } from "typegpu";

/*
 * Small procedural noise helpers written as TypeGPU functions.
 * The "use gpu" directive lets unplugin-typegpu compile them to WGSL, so the materials below can
 * call them from shader code. They still run as plain JS too, which keeps them easy to test.
 */

/** Pseudo-random number in [0, 1) for a 2D cell. */
export const hash2 = (cell: d.v2f): number => {
  "use gpu";
  return std.fract(std.sin(std.dot(cell, d.vec2f(127.1, 311.7))) * 43758.5453);
};

/** Smooth value noise in [0, 1). */
export const valueNoise = (point: d.v2f): number => {
  "use gpu";
  const cell = std.floor(point);
  const local = std.fract(point);
  const eased = std.mul(std.mul(local, local), std.sub(d.vec2f(3), std.mul(2, local)));

  const bottomLeft = hash2(cell);
  const bottomRight = hash2(std.add(cell, d.vec2f(1, 0)));
  const topLeft = hash2(std.add(cell, d.vec2f(0, 1)));
  const topRight = hash2(std.add(cell, d.vec2f(1, 1)));

  return std.mix(
    std.mix(bottomLeft, bottomRight, eased.x),
    std.mix(topLeft, topRight, eased.x),
    eased.y,
  );
};

/** Three octaves of value noise: soft large blobs with a little detail on top. */
export const fbm = (point: d.v2f): number => {
  "use gpu";
  return (
    valueNoise(point) * 0.55 +
    valueNoise(std.mul(point, 2.03)) * 0.3 +
    valueNoise(std.mul(point, 4.01)) * 0.15
  );
};
