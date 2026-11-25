/**
 * The town on the coast, as plain numbers. No GPU imports: the simulation and the renderers read
 * these arrays, and the rules stay testable on the CPU.
 */

/** World width in metres along x and z. */
export const SIZE = 200;
/** Simulation cells per side. Terrain and water share this grid. */
export const CELLS = 320;
/** Metres across one cell. */
export const CELL = SIZE / CELLS;
/** Distance between the first and the last cell centre. */
export const SPAN = (CELLS - 1) * CELL;

/** Where the sea floor ends and where the beach meets dry land, along z. */
export const SEA_EDGE = -66;
export const SHORE = -52;
/** Sea floor depth below the calm sea level at y = 0. */
const SEA_FLOOR = -3.5;

/** The town's footprint, with a road on every side of each block. */
export const TOWN = { minX: -94, maxX: 94, minZ: -30, maxZ: 94 } as const;
/** The promenade between the beach and the first street, as a band along z. */
export const PROMENADE = { near: -37, far: -32 } as const;
/** The heart of downtown, where the towers rise. */
const DOWNTOWN = [4, 34] as const;
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

export type Color = readonly [number, number, number];

/** How a part's walls are glazed: none, a house's or flat's windows, or an office's bands. */
export const NO_WINDOWS = 0;
export const HOME_WINDOWS = 1;
export const OFFICE_WINDOWS = 2;

/** One box of a building, placed from the building's centre at its base. */
export type Part = {
  /** Centre of the box, x and z from the building's centre, y from its base. */
  readonly x: number;
  readonly y: number;
  readonly z: number;
  readonly width: number;
  readonly height: number;
  readonly depth: number;
  readonly color: Color;
  readonly windows: number;
  /** Metres from one floor to the next, which spaces the rows of windows. */
  readonly storey: number;
  /** A gable roof whose ridge runs along x or z: a box turned 45 degrees about the ridge. */
  readonly ridge?: "x" | "z";
};

export type Kind = "house" | "townhouse" | "block" | "tower" | "hotel";

export type Building = {
  readonly kind: Kind;
  /** Centre of the footprint in world space, and its base height. */
  readonly x: number;
  readonly z: number;
  readonly base: number;
  /** The box around every part: what falls, and what the flood pushes on. */
  readonly width: number;
  readonly depth: number;
  readonly height: number;
  /** The main facade colour, which its rubble and dust take. */
  readonly color: Color;
  readonly parts: readonly Part[];
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

/** A rocky islet out in the bay, where the lighthouse stands. */
export const ISLET = { x: -52, z: -84, radius: 9, height: 2.6 } as const;

/**
 * Sea floor, then a beach, then a plain that climbs gently inland with low swells, and the islet
 * rising out of the bay.
 */
export function groundAt(x: number, z: number) {
  const land =
    0.4 + (z - SHORE) * 0.012 + Math.sin(x * 0.045) * 0.25 + Math.sin(z * 0.06 + 1) * 0.2;
  const ground = SEA_FLOOR + (land - SEA_FLOOR) * smoothstep(SEA_EDGE, SHORE, z);
  const out = Math.hypot(x - ISLET.x, z - ISLET.z) / ISLET.radius;
  const rocks = Math.sin(x * 0.9) * Math.sin(z * 1.1) * 0.25;
  const islet = ISLET.height + rocks - (ISLET.height - SEA_FLOOR) * smoothstep(0.55, 1.25, out);
  return Math.max(ground, islet);
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

const PLASTER: readonly Color[] = [
  [0.86, 0.8, 0.68],
  [0.9, 0.88, 0.82],
  [0.78, 0.66, 0.52],
  [0.84, 0.74, 0.6],
  [0.72, 0.74, 0.66],
];
const PASTEL: readonly Color[] = [
  [0.86, 0.62, 0.5],
  [0.62, 0.7, 0.78],
  [0.88, 0.8, 0.56],
  [0.7, 0.78, 0.64],
  [0.82, 0.58, 0.6],
  [0.76, 0.7, 0.86],
];
const CONCRETE: readonly Color[] = [
  [0.7, 0.7, 0.68],
  [0.62, 0.6, 0.58],
  [0.78, 0.74, 0.66],
];
const GLASS: readonly Color[] = [
  [0.32, 0.42, 0.5],
  [0.4, 0.46, 0.5],
  [0.26, 0.32, 0.38],
  [0.5, 0.52, 0.5],
];
const ROOFS: readonly Color[] = [
  [0.62, 0.26, 0.16],
  [0.36, 0.32, 0.3],
  [0.52, 0.3, 0.2],
];
const CORNICE: Color = [0.92, 0.9, 0.84];
const ROOFTOP: Color = [0.5, 0.5, 0.5];

type Random = () => number;
const pick = <T>(random: Random, list: readonly T[]) => list[Math.floor(random() * list.length)];
const between = (random: Random, low: number, high: number) => low + random() * (high - low);
const floors = (random: Random, low: number, high: number) =>
  low + Math.floor(random() * (high - low + 1));

/** A house of one or two storeys under a pitched roof. */
function house(random: Random, lot: number): Part[] {
  const width = between(random, 0.55, 0.75) * lot;
  const depth = between(random, 0.6, 0.8) * lot;
  const storey = 3;
  const walls = storey * floors(random, 1, 2);
  const ridge = width < depth ? "z" : "x";
  const span = Math.min(width, depth) + 0.6;
  const side = span / Math.SQRT2;
  return [
    {
      x: 0,
      y: walls / 2,
      z: 0,
      width,
      height: walls,
      depth,
      color: pick(random, PLASTER),
      windows: HOME_WINDOWS,
      storey,
    },
    {
      x: 0,
      y: walls,
      z: 0,
      width: ridge === "z" ? side : Math.max(width, depth) + 0.6,
      height: side,
      depth: ridge === "z" ? Math.max(width, depth) + 0.6 : side,
      color: pick(random, ROOFS),
      windows: NO_WINDOWS,
      storey,
      ridge,
    },
  ];
}

/** A town house of three to five storeys under a cornice. */
function townhouse(random: Random, lot: number): Part[] {
  const width = between(random, 0.8, 0.92) * lot;
  const depth = between(random, 0.8, 0.92) * lot;
  const storey = 3.4;
  const walls = storey * floors(random, 3, 5);
  return [
    {
      x: 0,
      y: walls / 2,
      z: 0,
      width,
      height: walls,
      depth,
      color: pick(random, PASTEL),
      windows: HOME_WINDOWS,
      storey,
    },
    {
      x: 0,
      y: walls + 0.25,
      z: 0,
      width: width + 0.5,
      height: 0.5,
      depth: depth + 0.5,
      color: CORNICE,
      windows: NO_WINDOWS,
      storey,
    },
  ];
}

/** A block of flats with a lift room on the roof. */
function block(random: Random, lot: number): Part[] {
  const width = between(random, 0.82, 0.92) * lot;
  const depth = between(random, 0.65, 0.9) * lot;
  const storey = 3;
  const walls = storey * floors(random, 5, 9);
  return [
    {
      x: 0,
      y: walls / 2,
      z: 0,
      width,
      height: walls,
      depth,
      color: pick(random, CONCRETE),
      windows: HOME_WINDOWS,
      storey,
    },
    {
      x: between(random, -1, 1),
      y: walls + 1.25,
      z: between(random, -1, 1),
      width: 3,
      height: 2.5,
      depth: 3.5,
      color: ROOFTOP,
      windows: NO_WINDOWS,
      storey,
    },
  ];
}

/** An office tower that steps back as it rises, with a mast on top. */
function tower(random: Random, lot: number, height: number): Part[] {
  const storey = 3.6;
  const color = pick(random, GLASS);
  const parts: Part[] = [];
  let size = between(random, 0.85, 0.95) * lot;
  let top = 0;
  let remaining = height;
  for (let tier = 0; tier < 3 && remaining > storey * 2; tier++) {
    const tall =
      tier === 2
        ? remaining
        : storey * Math.max(2, Math.round((remaining * between(random, 0.45, 0.65)) / storey));
    parts.push({
      x: 0,
      y: top + tall / 2,
      z: 0,
      width: size,
      height: tall,
      depth: size,
      color,
      windows: OFFICE_WINDOWS,
      storey,
    });
    top += tall;
    remaining -= tall;
    size *= between(random, 0.7, 0.82);
  }
  parts.push({
    x: 0,
    y: top + 3,
    z: 0,
    width: 0.3,
    height: 6,
    depth: 0.3,
    color: ROOFTOP,
    windows: NO_WINDOWS,
    storey,
  });
  return parts;
}

/**
 * A pastel hotel on the beachfront: a few storeys under a white cornice, with a stepped crown
 * that carries its sign, as the seaside hotels of the 1930s did.
 */
function hotel(random: Random, lot: number): Part[] {
  const width = between(random, 0.82, 0.92) * lot;
  const depth = between(random, 0.75, 0.9) * lot;
  const storey = 3.2;
  const walls = storey * floors(random, 3, 6);
  const color = pick(random, PASTEL);
  return [
    { x: 0, y: walls / 2, z: 0, width, height: walls, depth, color, windows: HOME_WINDOWS, storey },
    {
      x: 0,
      y: walls + 0.2,
      z: 0,
      width: width + 0.4,
      height: 0.4,
      depth: depth + 0.4,
      color: CORNICE,
      windows: NO_WINDOWS,
      storey,
    },
    {
      x: 0,
      y: walls + 1.4,
      z: -depth * 0.3,
      width: width * 0.9,
      height: 2.4,
      depth: 0.8,
      color: CORNICE,
      windows: NO_WINDOWS,
      storey,
    },
  ];
}

/** Wraps parts into a building standing on the ground at a lot's centre. */
function building(kind: Kind, x: number, z: number, parts: Part[]): Building {
  let left = Infinity;
  let right = -Infinity;
  let near = Infinity;
  let far = -Infinity;
  let top = 0;
  for (const part of parts) {
    left = Math.min(left, part.x - part.width / 2);
    right = Math.max(right, part.x + part.width / 2);
    near = Math.min(near, part.z - part.depth / 2);
    far = Math.max(far, part.z + part.depth / 2);
    top = Math.max(top, part.y + part.height / 2);
  }
  const width = parts[0].width;
  const depth = parts[0].depth;
  const base = Math.min(
    groundAt(x - width / 2, z - depth / 2),
    groundAt(x + width / 2, z - depth / 2),
    groundAt(x - width / 2, z + depth / 2),
    groundAt(x + width / 2, z + depth / 2),
  );
  return {
    kind,
    x,
    z,
    base: base - 0.2,
    width: right - left,
    depth: far - near,
    height: top,
    color: parts[0].color,
    parts,
  };
}

/**
 * Four lots per block. Pastel hotels line the beachfront, towers and blocks of flats crowd the centre,
 * town houses ring it, and houses with gardens fill the edges of town.
 */
function placeBuildings(random: Random) {
  const buildings: Building[] = [];
  const lot = (BLOCK - ROAD) / 2;

  for (let bx = TOWN.minX; bx + BLOCK <= TOWN.maxX + ROAD; bx += BLOCK) {
    for (let bz = TOWN.minZ; bz + BLOCK <= TOWN.maxZ + ROAD; bz += BLOCK) {
      const beachfront = bz === TOWN.minZ;
      for (let lz = 0; lz < 2; lz++) {
        const z = bz + ROAD + lot * (lz + 0.5);
        for (let lx = 0; lx < 2; lx++) {
          const x = bx + ROAD + lot * (lx + 0.5);
          if (beachfront) {
            if (random() < 0.85) buildings.push(building("hotel", x, z, hotel(random, lot)));
            continue;
          }
          const centre = Math.hypot(x - DOWNTOWN[0], z - DOWNTOWN[1]);
          const downtown = 1 - Math.min(centre / 45, 1);
          const outskirts = Math.min(Math.max((centre - 55) / 30, 0), 1);
          if (random() < 0.06 + outskirts * 0.18) continue;
          const roll = random();
          if (downtown > 0 && roll < downtown * 0.9) {
            buildings.push(
              building("tower", x, z, tower(random, lot, 16 + downtown * between(random, 14, 42))),
            );
          } else if (roll < 0.45 - outskirts * 0.4 + downtown * 0.3) {
            buildings.push(building("block", x, z, block(random, lot)));
          } else if (roll < 0.8 - outskirts * 0.55) {
            buildings.push(building("townhouse", x, z, townhouse(random, lot)));
          } else {
            buildings.push(building("house", x, z, house(random, lot)));
          }
        }
      }
    }
  }
  return buildings;
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
