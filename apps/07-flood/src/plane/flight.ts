import { d, type TgpuUniform } from "typegpu";

import { multiply, rotate, turnAbout, type Quaternion, type Vec3 } from "@/world/beach";

import { AIRFRAME, PROPELLER, type createAirframe } from "./airframe";

/** The plane circles the town on an ellipse: its centre, its radii and its height, in metres. */
export const CENTRE = d.vec2f(0, 8);
export const RADII = d.vec2f(115, 88);
export const ALTITUDE = 58;
/** Radians of the ellipse flown per second. */
const RATE = 0.075;
/** How far the plane banks into its turn, in radians. */
const BANK = 0.32;

/** The banner, in metres: how far behind the plane it starts, how long and how tall it is. */
export const TOW = 9;
export const LENGTH = 30;
export const HEIGHT = 5;

export const Flight = d.struct({ angle: d.f32, time: d.f32 });

type Airframe = ReturnType<typeof createAirframe>;

export function createFlight(input: {
  readonly flight: TgpuUniform<typeof Flight>;
  readonly parts: Airframe["parts"];
  readonly rows: Airframe["rows"];
  readonly towline: Airframe["towline"];
}) {
  const { flight, parts, rows, towline } = input;

  let angle = 0;
  let seconds = 0;

  const pathCpu = (at: number): Vec3 => [
    CENTRE.x + RADII.x * Math.cos(at),
    ALTITUDE + Math.sin(at * 2) * 3,
    CENTRE.y + RADII.y * Math.sin(at),
  ];

  return {
    update(dt: number) {
      seconds += dt;
      angle += RATE * dt;
      flight.write({ angle, time: seconds });

      const here = pathCpu(angle);
      const next = pathCpu(angle + 0.01);
      const ahead: Vec3 = [next[0] - here[0], next[1] - here[1], next[2] - here[2]];
      const yaw = Math.atan2(ahead[0], ahead[2]);
      const climb = Math.atan2(ahead[1], Math.hypot(ahead[0], ahead[2]));
      // Flying the ellipse anticlockwise seen from above, it banks to its left, into the turn
      const turn: Quaternion = multiply(
        multiply(turnAbout([0, 1, 0], yaw), turnAbout([1, 0, 0], -climb)),
        turnAbout([0, 0, 1], -BANK),
      );
      [...AIRFRAME, PROPELLER].forEach((part, i) => {
        const spin =
          part === PROPELLER ? turnAbout([0, 0, 1], seconds * 40) : ([0, 0, 0, 1] as const);
        const offset = rotate(turn, part.offset);
        parts.write(rows[i], {
          position: [here[0] + offset[0], here[1] + offset[1], here[2] + offset[2]],
          rotation: multiply(turn, spin),
          scale: part.size,
        });
      });

      // The tow line runs from the tail to the banner's front edge
      const radius = (RADII.x + RADII.y) / 2;
      const tail = rotate(turn, [0, 0, -3.6]);
      const from: Vec3 = [here[0] + tail[0], here[1] + tail[1], here[2] + tail[2]];
      const banner = pathCpu(angle - TOW / radius);
      const to: Vec3 = [banner[0], banner[1] - 1.5 - HEIGHT / 2, banner[2]];
      const line: Vec3 = [to[0] - from[0], to[1] - from[1], to[2] - from[2]];
      const length = Math.hypot(...line);
      const lineYaw = Math.atan2(line[0], line[2]);
      const linePitch = -Math.atan2(line[1], Math.hypot(line[0], line[2]));
      parts.write(towline, {
        position: [(from[0] + to[0]) / 2, (from[1] + to[1]) / 2, (from[2] + to[2]) / 2],
        rotation: multiply(turnAbout([0, 1, 0], lineYaw), turnAbout([1, 0, 0], linePitch)),
        scale: [0.05, 0.05, length],
      });
      parts.flush();
    },

    get position() {
      return pathCpu(angle);
    },
  };
}
