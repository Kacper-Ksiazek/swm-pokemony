import type { KksiazekOrientationChangeEvent } from "./KksiazekDeviceOrientation.types";
import KksiazekDeviceOrientation from "./KksiazekDeviceOrientationModule";

export type {
  KksiazekOrientation,
  KksiazekOrientationChangeEvent,
} from "./KksiazekDeviceOrientation.types";

export function getOrientationAsync() {
  console.log("🩵 [kksiazek-device-orientation] getOrientationAsync()");

  return KksiazekDeviceOrientation.getOrientationAsync();
}

export function addOrientationChangeListener(
  listener: (event: KksiazekOrientationChangeEvent) => void,
) {
  console.log("🩵 [kksiazek-device-orientation] addOrientationChangeListener()");

  return KksiazekDeviceOrientation.addListener("onOrientationChange", listener);
}
