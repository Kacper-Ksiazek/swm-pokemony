import { d, tgpu } from "typegpu";

import { CELL, CELLS, SPAN } from "@/world/layout";

/**
 * The four sides of the map as walls, one quad per cell along each side, so the town reads as a
 * model cut out of the land: terrain shows its soil and the water its depth.
 */
const SEGMENTS = CELLS - 1;
const PER_SIDE = SEGMENTS * 6;
export const EDGE_VERTICES = 4 * PER_SIDE;

/** A quad's corners: how far along the segment, and 1 at the top or 0 at the bottom. */
const ALONG = tgpu.const(d.arrayOf(d.i32, 6), [0, 1, 0, 0, 1, 1]);
const TOP = tgpu.const(d.arrayOf(d.f32, 6), [1, 1, 0, 0, 1, 0]);

export const EdgeVertex = d.struct({
  /** The border cell the vertex stands on. */
  cell: d.vec2i,
  /** 1 for the top of the wall, 0 for its foot. */
  top: d.f32,
  /** Points out of the map. */
  normal: d.vec3f,
});

export const edgeVertexOf = (vertexIndex: number) => {
  "use gpu";
  const side = d.i32(vertexIndex / PER_SIDE);
  const within = d.i32(vertexIndex % PER_SIDE);
  const corner = within % 6;
  const step = d.i32(within / 6) + ALONG.$[corner];

  let cell = d.vec2i(step, 0);
  let normal = d.vec3f(0, 0, -1);
  if (side === 1) {
    cell = d.vec2i(step, CELLS - 1);
    normal = d.vec3f(0, 0, 1);
  } else if (side === 2) {
    cell = d.vec2i(0, step);
    normal = d.vec3f(-1, 0, 0);
  } else if (side === 3) {
    cell = d.vec2i(CELLS - 1, step);
    normal = d.vec3f(1, 0, 0);
  }
  return EdgeVertex({ cell, top: TOP.$[corner], normal });
};

/** The world x and z of a cell's corner on the grid both the terrain and water meshes use. */
export const placeOf = (cell: d.v2i) => {
  "use gpu";
  return d.vec2f(cell) * CELL - SPAN / 2;
};
