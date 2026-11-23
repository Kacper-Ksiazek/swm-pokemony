import type { PedalState } from "../../../sensors.types";

/** When both pedals are held, the last pressed pedal wins; otherwise brake, gas, or coast. */
export function resolvePedalState(
  isBrake: boolean,
  isGas: boolean,
  lastPedal: "brake" | "gas",
): PedalState {
  "worklet";

  if (isBrake && isGas) {
    return lastPedal;
  }
  if (isBrake) {
    return "brake";
  }
  if (isGas) {
    return "gas";
  }

  return "coast";
}
