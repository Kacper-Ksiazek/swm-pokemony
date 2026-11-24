/**
 * Flood walls as plain numbers: straight segments with a height, and the obstacle heights they
 * add to the simulation grid. No GPU imports.
 */
import { CELL, CELLS, centreOf, groundAt, SPAN } from "@/world/layout";

/** Wall thickness in metres. */
export const THICKNESS = 1.2;
/** Shortest wall worth building, in metres. */
export const SHORTEST = 2;
/** Grid the ends snap to, in metres. */
const SNAP = 0.5;
/** How far below the lowest ground under it a wall's foundation reaches. */
const FOOTING = 0.5;
/** Length of the sections a wall is cast in; each one stands or breaks on its own. */
export const PANEL_LENGTH = 4;
/** Sections standing at once across every wall. */
export const PANELS = 600;
/** Height of the broken concrete a fallen section leaves, in metres. */
export const WALL_RUBBLE = 0.6;
/**
 * How many times the push of still water up to its top a section withstands. Above 1, a wall
 * holds back water at its brim; the rush of a wave on top of that is what breaks it.
 */
const SAFETY = 1.7;
const GRAVITY = 9.81;

export type Point = readonly [number, number];

export type Wall = {
  readonly id: number;
  readonly from: Point;
  readonly to: Point;
  /** Height above the highest ground along the wall, in metres. */
  readonly height: number;
  /** World heights of the foundation and of the flat top. */
  readonly base: number;
  readonly top: number;
};

export const snap = ([x, z]: Point): Point => [
  Math.round(x / SNAP) * SNAP,
  Math.round(z / SNAP) * SNAP,
];

export const lengthOf = (from: Point, to: Point) => Math.hypot(to[0] - from[0], to[1] - from[1]);

/** One cast section of a wall, which holds or breaks on its own. */
export type Panel = {
  /** Its slot among every wall's sections, which also numbers its push and its row. */
  readonly slot: number;
  readonly wall: number;
  readonly from: Point;
  readonly to: Point;
  readonly base: number;
  readonly top: number;
  /** Whether each end is an end of the whole wall, where the concrete wraps the corner. */
  readonly ends: readonly [boolean, boolean];
};

/** Cuts a wall into sections of about `PANEL_LENGTH`, each taking the next free slot. */
export function panelsOf(wall: Wall, slots: readonly number[]): Panel[] {
  const count = slots.length;
  const at = (t: number): Point => [
    wall.from[0] + (wall.to[0] - wall.from[0]) * t,
    wall.from[1] + (wall.to[1] - wall.from[1]) * t,
  ];
  return slots.map((slot, i) => ({
    slot,
    wall: wall.id,
    from: at(i / count),
    to: at((i + 1) / count),
    base: wall.base,
    top: wall.top,
    ends: [i === 0, i === count - 1],
  }));
}

/** How many sections a wall between two points is cast in. */
export const panelCount = (from: Point, to: Point) =>
  Math.max(1, Math.round(lengthOf(from, to) / PANEL_LENGTH));

/**
 * Kilonewtons a section withstands: the push of still water up to its top along its length,
 * half rho g h squared per metre, times the safety margin.
 */
export function strengthOf(panel: Panel) {
  const middle = groundAt((panel.from[0] + panel.to[0]) / 2, (panel.from[1] + panel.to[1]) / 2);
  const height = panel.top - middle;
  return SAFETY * 0.5 * GRAVITY * height * height * lengthOf(panel.from, panel.to);
}

/** A wall from one end to the other, its top level and high enough over the ground it crosses. */
export function makeWall(id: number, from: Point, to: Point, height: number): Wall {
  const steps = Math.max(1, Math.ceil(lengthOf(from, to) / SNAP));
  let lowest = Infinity;
  let highest = -Infinity;
  for (let i = 0; i <= steps; i++) {
    const t = i / steps;
    const ground = groundAt(from[0] + (to[0] - from[0]) * t, from[1] + (to[1] - from[1]) * t);
    lowest = Math.min(lowest, ground);
    highest = Math.max(highest, ground);
  }
  return { id, from, to, height, base: lowest - FOOTING, top: highest + height };
}

/** Distance from a point to a wall's centre line. */
export function distanceTo(wall: { from: Point; to: Point }, [x, z]: Point) {
  const [ax, az] = wall.from;
  const [bx, bz] = wall.to;
  const length = (bx - ax) ** 2 + (bz - az) ** 2;
  const t =
    length === 0
      ? 0
      : Math.max(0, Math.min(1, ((x - ax) * (bx - ax) + (z - az) * (bz - az)) / length));
  return Math.hypot(x - (ax + (bx - ax) * t), z - (az + (bz - az) * t));
}

/** The wall nearest a point, if one is within reach. */
export function wallNear(walls: readonly Wall[], point: Point, reach = 2) {
  let nearest: Wall | undefined;
  let best = reach;
  for (const wall of walls) {
    const distance = distanceTo(wall, point);
    if (distance < best) {
      best = distance;
      nearest = wall;
    }
  }
  return nearest;
}

/**
 * Writes how high the sections stand above the ground in each cell they cover, so the water
 * meets them as it meets buildings, and which section owns each cell, so the water's push on it
 * can be measured. A broken section leaves a low heap and owns nothing. A cell counts when its
 * centre lies within half the thickness plus a little of a cell, so even a thin diagonal wall
 * leaves no gap for water to slip through.
 */
export function rasterize(
  panels: readonly Panel[],
  broken: (slot: number) => boolean,
  ground: Float32Array,
  heights: Float32Array,
  owners: Uint32Array,
  /** Owner numbers start after this, past the buildings'. */
  ownerOffset: number,
) {
  heights.fill(0);
  owners.fill(0);
  const reach = THICKNESS / 2 + CELL * 0.75;
  const cellOf = (at: number) => Math.round((at + SPAN / 2) / CELL);
  for (const panel of panels) {
    const down = broken(panel.slot);
    const fromColumn = Math.max(0, cellOf(Math.min(panel.from[0], panel.to[0]) - reach));
    const toColumn = Math.min(CELLS - 1, cellOf(Math.max(panel.from[0], panel.to[0]) + reach));
    const fromRow = Math.max(0, cellOf(Math.min(panel.from[1], panel.to[1]) - reach));
    const toRow = Math.min(CELLS - 1, cellOf(Math.max(panel.from[1], panel.to[1]) + reach));
    for (let row = fromRow; row <= toRow; row++) {
      for (let column = fromColumn; column <= toColumn; column++) {
        if (distanceTo(panel, [centreOf(column), centreOf(row)]) > reach) continue;
        const index = row * CELLS + column;
        const height = down
          ? Math.min(WALL_RUBBLE, panel.top - ground[index])
          : panel.top - ground[index];
        if (height <= heights[index]) continue;
        heights[index] = height;
        owners[index] = down ? 0 : ownerOffset + panel.slot + 1;
      }
    }
  }
}
