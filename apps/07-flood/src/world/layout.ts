/**
 * The town on the coast, as plain numbers. No GPU imports: the simulation and the renderers read
 * these arrays, and the rules stay testable on the CPU.
 */

/** World width in metres along x and z. */
export const SIZE = 160;
/** Simulation cells per side. Terrain and water share this grid. */
export const CELLS = 256;
/** Metres across one cell. */
export const CELL = SIZE / CELLS;
/** Distance between the first and the last cell centre. */
export const SPAN = (CELLS - 1) * CELL;

/** Where the sea floor ends and where the beach meets dry land, along z. */
export const SEA_EDGE = -50;
export const SHORE = -36;
/** Sea floor depth below the calm sea level at y = 0. */
const SEA_FLOOR = -3.5;

/** The town's footprint, with a road on every side of each block. */
export const TOWN = { minX: -72, maxX: 72, minZ: -26, maxZ: 70 } as const;
/** Distance between road centre lines, and road width, in metres. */
export const BLOCK = 24;
export const ROAD = 4;

/** Centre lines of every full road, which cross at the junctions cars drive between. */
const centreLines = (from: number, to: number) => {
  const lines: number[] = [];
  for (let at = from; at + ROAD <= to; at += BLOCK) lines.push(at + ROAD / 2);
  return lines;
};
/** Roads running along z, by their x, and roads running along x, by their z. */
export const ROADS_ACROSS = centreLines(TOWN.minX, TOWN.maxX);
export const ROADS_ALONG = centreLines(TOWN.minZ, TOWN.maxZ);

export type Building = {
  /** Centre of the footprint in world space, and its base height. */
  readonly x: number;
  readonly z: number;
  readonly base: number;
  readonly width: number;
  readonly depth: number;
  readonly height: number;
  /** Linear RGB facade colour. */
  readonly color: readonly [number, number, number];
};

export type Layout = {
  /** Terrain height per cell, row by row along +z. */
  readonly ground: Float32Array;
  /** Extra solid height above the ground per cell: building tops for now. */
  readonly solid: Float32Array;
  /** Water depth per cell before the flood: the calm sea. */
  readonly depth: Float32Array;
  /** The building standing on each cell, as its index plus one, or 0 for open ground. */
  readonly owner: Uint32Array;
  /** Each building's cells, by index. */
  readonly footprints: readonly (readonly number[])[];
  readonly buildings: readonly Building[];
};

/** World x or z of a cell centre. */
export const centreOf = (cell: number) => cell * CELL - SPAN / 2;

const smoothstep = (from: number, to: number, x: number) => {
  const t = Math.min(Math.max((x - from) / (to - from), 0), 1);
  return t * t * (3 - 2 * t);
};

/** Sea floor, then a beach, then a plain that climbs gently inland with low swells. */
export function groundAt(x: number, z: number) {
  const land =
    0.4 + (z - SHORE) * 0.012 + Math.sin(x * 0.045) * 0.25 + Math.sin(z * 0.06 + 1) * 0.2;
  return SEA_FLOOR + (land - SEA_FLOOR) * smoothstep(SEA_EDGE, SHORE, z);
}

const inTown = (x: number, z: number) =>
  x >= TOWN.minX && x <= TOWN.maxX && z >= TOWN.minZ && z <= TOWN.maxZ;

/** True on the town's road grid. The GPU ground material repeats this test. */
export function isRoad(x: number, z: number) {
  if (!inTown(x, z)) return false;
  const along = (x - TOWN.minX) % BLOCK;
  const across = (z - TOWN.minZ) % BLOCK;
  return along < ROAD || across < ROAD;
}

/** Seeded random numbers, so every reset builds the same town. */
function seeded(seed: number) {
  let state = seed >>> 0;
  return () => {
    state = (state + 0x6d2b79f5) >>> 0;
    let t = state;
    t = Math.imul(t ^ (t >>> 15), t | 1);
    t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

const FACADES: readonly (readonly [number, number, number])[] = [
  [0.78, 0.72, 0.62],
  [0.62, 0.52, 0.44],
  [0.82, 0.8, 0.76],
  [0.55, 0.58, 0.62],
  [0.74, 0.5, 0.38],
  [0.66, 0.68, 0.58],
];

/** Four lots per block, most with a building. Taller towers stand nearer the town centre. */
function placeBuildings(random: () => number) {
  const buildings: Building[] = [];
  const lot = (BLOCK - ROAD) / 2;

  for (let bx = TOWN.minX; bx + BLOCK <= TOWN.maxX + ROAD; bx += BLOCK) {
    for (let bz = TOWN.minZ; bz + BLOCK <= TOWN.maxZ + ROAD; bz += BLOCK) {
      for (let lx = 0; lx < 2; lx++) {
        for (let lz = 0; lz < 2; lz++) {
          if (random() < 0.15) continue;
          const x = bx + ROAD + lot * (lx + 0.5);
          const z = bz + ROAD + lot * (lz + 0.5);
          const width = lot * (0.6 + random() * 0.3);
          const depth = lot * (0.6 + random() * 0.3);
          const central = 1 - Math.min(Math.hypot(x, z - 20) / 80, 1);
          const height = 4 + random() * 8 + central * central * random() * 22;
          const base = Math.min(
            groundAt(x - width / 2, z - depth / 2),
            groundAt(x + width / 2, z - depth / 2),
            groundAt(x - width / 2, z + depth / 2),
            groundAt(x + width / 2, z + depth / 2),
          );
          const color = FACADES[Math.floor(random() * FACADES.length)];
          buildings.push({ x, z, base: base - 0.2, width, depth, height, color });
        }
      }
    }
  }
  return buildings;
}

/** The cells whose centres lie inside a building's footprint. */
function footprintOf(building: Building) {
  const from = (at: number, half: number) => Math.ceil((at - half + SPAN / 2) / CELL);
  const to = (at: number, half: number) => Math.floor((at + half + SPAN / 2) / CELL);
  const cells: number[] = [];
  for (
    let row = from(building.z, building.depth / 2);
    row <= to(building.z, building.depth / 2);
    row++
  ) {
    for (
      let column = from(building.x, building.width / 2);
      column <= to(building.x, building.width / 2);
      column++
    ) {
      cells.push(row * CELLS + column);
    }
  }
  return cells;
}

export function createLayout(seed = 7): Layout {
  const ground = new Float32Array(CELLS * CELLS);
  const solid = new Float32Array(CELLS * CELLS);
  const depth = new Float32Array(CELLS * CELLS);

  for (let row = 0; row < CELLS; row++) {
    for (let column = 0; column < CELLS; column++) {
      const height = groundAt(centreOf(column), centreOf(row));
      ground[row * CELLS + column] = height;
      depth[row * CELLS + column] = Math.max(0, -height);
    }
  }

  const buildings = placeBuildings(seeded(seed));
  const owner = new Uint32Array(CELLS * CELLS);
  const footprints = buildings.map((building, index) => {
    const cells = footprintOf(building);
    for (const cell of cells) {
      solid[cell] = Math.max(solid[cell], building.base + building.height - ground[cell]);
      owner[cell] = index + 1;
    }
    return cells;
  });

  return { ground, solid, depth, owner, footprints, buildings };
}
