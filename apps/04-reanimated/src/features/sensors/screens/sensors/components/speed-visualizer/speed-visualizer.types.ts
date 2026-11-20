import type { SharedValue } from "react-native-reanimated";

import type { PedalState } from "../../sensors.types";

export type SpeedVisualizerProps = {
  speedKmh: number;
  pedalState: PedalState;
  liveSpeedKmh: SharedValue<number>;
};
