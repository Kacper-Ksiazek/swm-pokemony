import { NativeModule, requireNativeModule } from "expo";

import type {
  KksiazekOrientation,
  KksiazekOrientationChangeEvent,
} from "./KksiazekDeviceOrientation.types";

export type KksiazekDeviceOrientationModuleEvents = {
  onOrientationChange: (event: KksiazekOrientationChangeEvent) => void;
};

declare class KksiazekDeviceOrientationModule extends NativeModule<KksiazekDeviceOrientationModuleEvents> {
  getOrientationAsync(): Promise<KksiazekOrientation>;
}

export default requireNativeModule<KksiazekDeviceOrientationModule>("KksiazekDeviceOrientation");
