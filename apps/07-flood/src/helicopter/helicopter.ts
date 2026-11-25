import { lighting, type meshPool, type table } from "@typegpu/kit";
import type { TgpuRoot } from "typegpu";

import type { Vec3 } from "@/world/beach";

import { createAirframe } from "./airframe";
import { createBeam } from "./beam";
import { createFlight } from "./flight";

/** Where a helicopter waits out of sight by default, and the height it searches from. */
const HANGAR: Vec3 = [140, 60, 120];
const ALTITUDE = 32;

export type HelicopterOptions = {
  /** Where it waits out of sight and returns to. Default far inland, to the north-east. */
  readonly hangar?: Vec3;
  /** Where on its circle it starts, in radians, so several keep apart. Default 0. */
  readonly phase?: number;
  /** Metres above or below the usual search height, so several do not collide. Default 0. */
  readonly lift?: number;
};

/** How far the searchlight's pool of light reaches. */
const SPOT_RANGE = 11;

/**
 * A rescue helicopter that comes when the wave is released. It flies in, circles over the flood
 * and sweeps the water with a searchlight: a real light that pools on what it points at, and a
 * beam of light through the air above it.
 */
export function createHelicopter(
  root: TgpuRoot,
  pool: meshPool.MeshPool,
  lamps: table.Table<typeof lighting.PointLight>,
  options: HelicopterOptions = {},
) {
  const hangar = options.hangar ?? HANGAR;
  const altitude = ALTITUDE + (options.lift ?? 0);
  const airframe = createAirframe(root, pool, hangar);
  const spot = lamps.add({
    position: hangar,
    color: [0.85, 0.9, 1],
    intensity: 0,
    range: SPOT_RANGE,
  });
  const searchlight = createBeam(root, hangar);
  const flight = createFlight({
    airframe,
    beam: searchlight.beam,
    lamps,
    spot,
    hangar,
    altitude,
    options,
  });

  return {
    renderer: airframe.parts.renderer(),
    beam: searchlight.drawing,
    setActive: flight.setActive,
    setNight: flight.setNight,
    update: flight.update,
    destroy() {
      airframe.parts.destroy();
    },
  };
}
