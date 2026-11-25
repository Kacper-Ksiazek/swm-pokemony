import { d } from "typegpu";

import { CELLS } from "@/world/layout";

/** Acceleration the pipes and the wind waves share, in metres per second squared. */
export const GRAVITY = 9.81;
/** Depth below which a cell counts as dry, in metres. */
export const DRY = 0.01;

export const WORKGROUP = 8;
/** How many times a second the CPU learns the push on buildings and the watched points. */
export const PUSH_RATE = 8;

export const CELL_COUNT = CELLS * CELLS;
export const cells = d.arrayOf(d.f32, CELL_COUNT);
export const vec2Cells = d.arrayOf(d.vec2f, CELL_COUNT);
export const vec4Cells = d.arrayOf(d.vec4f, CELL_COUNT);
export const owners = d.arrayOf(d.u32, CELL_COUNT);

/** Values the CPU writes when they change: the step length and the sea level at the edge. */
export const Sim = d.struct({ dt: d.f32, sea: d.f32 });
/** Values written once a frame: simulated seconds this frame and in total. */
export const Look = d.struct({ dt: d.f32, time: d.f32 });

export type Cells = typeof cells;
export type Vec2Cells = typeof vec2Cells;
export type Vec4Cells = typeof vec4Cells;
export type Owners = typeof owners;

/** Index of a cell. Row 0 is the sea edge, and rows run inland toward +z. */
export const indexOf = (column: number, row: number) => {
  "use gpu";
  return d.u32(row) * CELLS + d.u32(column);
};

/** True when the column and row lie on the grid. */
export const inside = (column: number, row: number) => {
  "use gpu";
  return column >= 0 && row >= 0 && column < CELLS && row < CELLS;
};
