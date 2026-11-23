import type { TrafficPoolStepResult } from "../../use-racing-frame.types";
import type { StepTrafficPoolParams } from "./step-traffic-pool.types";
import { resolveTrafficLaneGaps } from "./utils/resolve-traffic-lane-gaps";
import { stepOneTrafficCar } from "./utils/step-one-traffic-car";

/** Integrate traffic Y/X, lane sway, respawns, and pairwise lane spacing for one frame. */
export function stepTrafficPool({
  cars,
  dt,
  forwardRate,
  playerLane,
  nextRand,
}: StepTrafficPoolParams): TrafficPoolStepResult {
  "worklet";

  let overtookCount = 0;

  const updatedCars = cars.map((car) => {
    const { car: nextCar, overtook } = stepOneTrafficCar({
      car,
      cars,
      dt,
      forwardRate,
      playerLane,
      nextRand,
    });
    overtookCount += overtook;
    return nextCar;
  });

  resolveTrafficLaneGaps(updatedCars);

  return { updatedCars, overtookCount };
}
