/** Where the sea floor ends and where the beach meets dry land, along z. */
export const SEA_EDGE = -66;
export const SHORE = -52;

/** The town's footprint, with a road on every side of each block. */
export const TOWN = { minX: -94, maxX: 94, minZ: -30, maxZ: 94 } as const;
/** The promenade between the beach and the first street, as a band along z. */
export const PROMENADE = { near: -37, far: -32 } as const;
/** The heart of downtown, where the towers rise. */
export const DOWNTOWN = [4, 34] as const;

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

/** A rocky islet out in the bay, where the lighthouse stands. */
export const ISLET = { x: -52, z: -84, radius: 9, height: 2.6 } as const;
