import { type Building, placeBuildings } from "./buildings";
import { CELL, CELLS, centreOf, SPAN } from "./grid";
import { groundAt } from "./ground";

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

/** Seeded random numbers, so every reset builds the same town. */
export function seeded(seed: number) {
  let state = seed >>> 0;

  return () => {
    state = (state + 0x6d2b79f5) >>> 0;
    let t = state;
    t = Math.imul(t ^ (t >>> 15), t | 1);
    t ^= t + Math.imul(t ^ (t >>> 7), t | 61);

    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

/** The cells whose centres lie inside a building's outline, with how high it stands on each. */
function footprintOf(building: Building) {
  const cellOf = (at: number) => (at + SPAN / 2) / CELL;
  const cells: number[] = [];
  const tops: number[] = [];
  const fromRow = Math.ceil(cellOf(building.z - building.depth / 2));
  const toRow = Math.floor(cellOf(building.z + building.depth / 2));
  const fromColumn = Math.ceil(cellOf(building.x - building.width / 2));
  const toColumn = Math.floor(cellOf(building.x + building.width / 2));

  for (let row = fromRow; row <= toRow; row++) {
    for (let column = fromColumn; column <= toColumn; column++) {
      const x = centreOf(column) - building.x;
      const z = centreOf(row) - building.z;
      let top = 0;

      for (const part of building.parts) {
        if (Math.abs(x - part.x) > part.width / 2 || Math.abs(z - part.z) > part.depth / 2)
          continue;
        top = Math.max(top, part.y + part.height / 2);
      }

      if (top === 0) continue;

      cells.push(row * CELLS + column);
      tops.push(building.base + top);
    }
  }

  return { cells, tops };
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
    const { cells, tops } = footprintOf(building);
    cells.forEach((cell, i) => {
      solid[cell] = Math.max(solid[cell], tops[i] - ground[cell]);
      owner[cell] = index + 1;
    });

    return cells;
  });

  return { ground, solid, depth, owner, footprints, buildings };
}
