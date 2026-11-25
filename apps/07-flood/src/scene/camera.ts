import { cameras } from "@typegpu/kit";

import { createPlane } from "@/plane";

import type { Wave } from "./ruins";

/** How the camera can move: as the viewer drags it, chasing the wave, or alongside the plane. */
export type Cinema = "free" | "wave" | "plane";

type View = ReturnType<typeof cameras.orbit>;
type Plane = ReturnType<typeof createPlane>;

export function createCamera(parts: {
  view: View;
  plane: Plane;
  sim: { readonly time: number };
  wave: Wave;
}) {
  const { view, plane, sim, wave } = parts;
  let cinema: Cinema = "free";
  let seconds = 0;

  /** Points the camera for the cinema modes, which the orbit then eases toward. */
  const direct = (dt: number) => {
    const goal = view.goal;
    if (cinema === "plane") {
      const [x, y, z] = plane.position;
      goal.target = [x, y - 4, z];
      goal.yaw = Math.atan2(x, z - 8) + 0.9;
      goal.distance = 48;
      goal.pitch = 0.18;
    } else if (cinema === "wave") {
      if (wave.flooding) {
        // The front runs inland at about seven metres a second; keep just ahead of it
        const front = Math.min(-62 + (sim.time - wave.flooding.since) * 7, 80);
        goal.target = [Math.sin(seconds * 0.12) * 30, 3, front];
        goal.yaw = 2.6 + Math.sin(seconds * 0.15) * 0.35;
        goal.distance = 80;
        goal.pitch = 0.38;
      } else {
        goal.target = [0, 6, 10];
        goal.yaw += dt * 0.06;
        goal.distance = 190;
        goal.pitch = 0.5;
      }
    }
  };

  const setCinema = (mode: Cinema) => {
    cinema = mode;
  };

  return {
    direct,
    setCinema,
    get seconds() {
      return seconds;
    },
    set seconds(value: number) {
      seconds = value;
    },
  };
}
