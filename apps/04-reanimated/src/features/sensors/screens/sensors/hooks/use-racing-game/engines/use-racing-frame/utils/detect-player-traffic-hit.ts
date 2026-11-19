import type { SharedValue } from "react-native-reanimated";

import {
  PLAYER_CAR_HEIGHT_NORM,
  PLAYER_CAR_WIDTH_NORM,
  PLAYER_Y_NORM,
} from "../../../../../constants";
import type { TrafficCar } from "../../../../../sensors.types";

/** Axis-aligned overlap between player norm position and one traffic car. */
export function detectPlayerTrafficHit(
  updatedCars: TrafficCar[],
  px: number,
  invulnerableSec: SharedValue<number>,
): boolean {
  "worklet";

  if (invulnerableSec.get() > 0) {
    return false;
  }

  for (let i = 0; i < updatedCars.length; i += 1) {
    const car = updatedCars[i];
    const dx = Math.abs(px - car.x);
    const dy = Math.abs(PLAYER_Y_NORM - car.y);
    const hitW = (PLAYER_CAR_WIDTH_NORM + car.widthNorm) * 0.36;
    const hitH = (PLAYER_CAR_HEIGHT_NORM + car.heightNorm) * 0.38;

    if (dx < hitW && dy < hitH) {
      return true;
    }
  }

  return false;
}
