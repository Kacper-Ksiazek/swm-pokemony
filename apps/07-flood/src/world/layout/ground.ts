import { BLOCK, ISLET, ROAD, SEA_EDGE, SHORE, TOWN } from "./town";

/** Sea floor depth below the calm sea level at y = 0. */
const SEA_FLOOR = -3.5;

const smoothstep = (from: number, to: number, x: number) => {
  const t = Math.min(Math.max((x - from) / (to - from), 0), 1);

  return t * t * (3 - 2 * t);
};

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
