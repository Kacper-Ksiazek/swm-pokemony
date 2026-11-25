import { lighting, type RowId, type table } from "@typegpu/kit";
import { d } from "typegpu";

import { multiply, rotate, turnAbout, type Quaternion, type Vec3 } from "@/world/beach";

import type { createAirframe } from "./airframe";
import type { createBeam } from "./beam";

/** The circle it flies over the flood: its radius, and how fast it goes round, in radians/s. */
const ORBIT = 34;
const ORBIT_RATE = 0.16;
/** How fast it flies in from the hangar, in metres per second. */
const CRUISE = 30;
/** How far ahead and below it points its searchlight. */
const AIM_AHEAD = 14;
/** The searchlight's pool of light on the ground. */
const SPOT_INTENSITY = 26;

type Airframe = ReturnType<typeof createAirframe>;
type Beam = ReturnType<typeof createBeam>;

/** Where the helicopter is, and the searchlight it aims while it flies. */
export function createFlight(input: {
  readonly airframe: Airframe;
  readonly beam: Beam["beam"];
  readonly lamps: table.Table<typeof lighting.PointLight>;
  readonly spot: RowId<typeof lighting.PointLight>;
  readonly hangar: Vec3;
  readonly altitude: number;
  readonly options: { readonly phase?: number };
}) {
  const { airframe, beam, lamps, spot, hangar, altitude, options } = input;
  const { parts, rows, all, mainRotor: MAIN_ROTOR, tailRotor: TAIL_ROTOR } = airframe;

  let position: Vec3 = hangar;
  let heading = 0;
  let active = false;
  let orbit = options.phase ?? 0;
  let spin = 0;
  let night = 0;

  return {
    /** Sends it out over the flood, or home again. */
    setActive(on: boolean) {
      active = on;
    },

    setNight(amount: number) {
      night = amount;
    },

    /** Flies on by `dt` real seconds, circling `centre` on the ground while it is out. */
    update(dt: number, centre: readonly [number, number]) {
      spin += dt * 40;
      orbit += dt * ORBIT_RATE;
      const goal: Vec3 = active
        ? [centre[0] + Math.cos(orbit) * ORBIT, altitude, centre[1] + Math.sin(orbit) * ORBIT]
        : hangar;
      const to: Vec3 = [goal[0] - position[0], goal[1] - position[1], goal[2] - position[2]];
      const distance = Math.hypot(...to);
      const step = Math.min(distance, CRUISE * dt);
      // Back at its base with nothing to do, it is out of sight: draw none of it
      const home = !active && distance - step < 0.5;

      if (distance > 0.01) {
        position = [
          position[0] + (to[0] / distance) * step,
          position[1] + (to[1] / distance) * step,
          position[2] + (to[2] / distance) * step,
        ];
        const wanted = Math.atan2(to[0], to[2]);
        let delta = wanted - heading;
        delta -= Math.round(delta / (2 * Math.PI)) * 2 * Math.PI;
        heading += delta * Math.min(1, dt * 2);
      }

      // It dips its nose when it flies fast and leans into the turn of its circle
      const pitch = Math.min(distance / 40, 1) * 0.18 + 0.06;
      const body: Quaternion = multiply(
        multiply(turnAbout([0, 1, 0], heading), turnAbout([1, 0, 0], pitch)),
        turnAbout([0, 0, 1], active ? -0.12 : 0),
      );
      all.forEach((piece, i) => {
        let own = piece.rotation;
        if (MAIN_ROTOR.includes(piece)) own = turnAbout([0, 1, 0], spin);
        if (piece === TAIL_ROTOR) own = turnAbout([1, 0, 0], spin * 1.5);

        const offset = rotate(body, piece.offset);
        parts.write(rows[i], {
          position: [position[0] + offset[0], position[1] + offset[1], position[2] + offset[2]],
          rotation: multiply(body, own),
          scale: home ? [0, 0, 0] : piece.size,
        });
      });
      parts.flush();

      // The searchlight points ahead and down, at the water or the ground below
      const lamp = rotate(body, [0, -0.9, 2.4]);
      const origin: Vec3 = [position[0] + lamp[0], position[1] + lamp[1], position[2] + lamp[2]];
      const ahead = rotate(turnAbout([0, 1, 0], heading), [0, 0, AIM_AHEAD]);
      const target: Vec3 = [origin[0] + ahead[0], 1, origin[2] + ahead[2]];
      const on = active ? 0.35 + night * 0.65 : 0;
      beam.write({ origin: d.vec3f(...origin), end: d.vec3f(...target), strength: on });
      lamps.write(spot, {
        position: [target[0], target[1] + 4, target[2]],
        intensity: SPOT_INTENSITY * on,
      });
    },
  };
}
