import type { TrafficCar } from "../../../../../../../sensors.types";

/** Nudge following cars apart in-place when same-lane gaps fall below body half-heights. */
export function resolveTrafficLaneGaps(cars: TrafficCar[]): void {
  "worklet";

  for (let i = 0; i < cars.length; i += 1) {
    for (let j = 0; j < cars.length; j += 1) {
      if (i === j) {
        continue;
      }

      const behind = cars[i];
      const ahead = cars[j];
      if (behind.lane !== ahead.lane || behind.y >= ahead.y) {
        continue;
      }
      const minGap = (behind.heightNorm + ahead.heightNorm) * 0.5 + 0.06;
      if (ahead.y - behind.y < minGap) {
        behind.y = ahead.y - minGap;
        if (behind.speed > ahead.speed) {
          behind.speed = ahead.speed;
        }
      }
    }
  }
}
