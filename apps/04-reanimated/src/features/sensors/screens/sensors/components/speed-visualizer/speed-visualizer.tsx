import { Text, View } from "react-native";
import Animated, { interpolateColor, useAnimatedProps } from "react-native-reanimated";
import Svg, { Path } from "react-native-svg";

import { MAX_SPEED_KMH, MIN_SPEED_KMH, VICE_COLORS } from "../../constants";
import {
  GAUGE_CX,
  GAUGE_CY,
  GAUGE_INITIAL_ARC_PATH,
  GAUGE_RADIUS,
  GAUGE_SIZE,
  GAUGE_START_ANGLE_DEG,
  GAUGE_STROKE_WIDTH,
  GAUGE_SWEEP_DEG,
  GAUGE_TRACK_PATH,
} from "./speed-visualizer.constants";
import { styles } from "./speed-visualizer.styles";
import type { SpeedVisualizerProps } from "./speed-visualizer.types";
import { describeArc } from "./utils/speed-gauge-arc";

const AnimatedPath = Animated.createAnimatedComponent(Path);

/** HUD speed gauge: arc fill from live speed and pedal mode label. */
export function SpeedVisualizer({ speedKmh, pedalState, liveSpeedKmh }: SpeedVisualizerProps) {
  const animatedProps = useAnimatedProps(() => {
    const ratio = Math.max(
      0.02,
      Math.min(1, (liveSpeedKmh.get() - MIN_SPEED_KMH) / (MAX_SPEED_KMH - MIN_SPEED_KMH)),
    );
    const endAngle = GAUGE_START_ANGLE_DEG + GAUGE_SWEEP_DEG * ratio;
    const stroke = interpolateColor(
      ratio,
      [0, 0.5, 1],
      [VICE_COLORS.cyan, VICE_COLORS.gold, VICE_COLORS.pink],
    );

    return {
      d: describeArc(GAUGE_CX, GAUGE_CY, GAUGE_RADIUS, GAUGE_START_ANGLE_DEG, endAngle),
      stroke,
    };
  });

  const modeLabel = pedalState === "gas" ? "NITRO" : pedalState === "brake" ? "HAMULEC" : "CRUISE";

  return (
    <View style={styles.card}>
      <View style={styles.gaugeWrapper}>
        <Svg width={GAUGE_SIZE} height={GAUGE_SIZE} viewBox={`0 0 ${GAUGE_SIZE} ${GAUGE_SIZE}`}>
          <Path
            d={GAUGE_TRACK_PATH}
            fill="none"
            stroke={VICE_COLORS.gaugeTrack}
            strokeWidth={GAUGE_STROKE_WIDTH}
            strokeLinecap="round"
          />
          <AnimatedPath
            d={GAUGE_INITIAL_ARC_PATH}
            animatedProps={animatedProps}
            fill="none"
            stroke={VICE_COLORS.cyan}
            strokeWidth={GAUGE_STROKE_WIDTH}
            strokeLinecap="round"
          />
        </Svg>

        <View style={styles.centerReadout} pointerEvents="none">
          <Text style={styles.speedValue}>{speedKmh}</Text>
          <Text style={styles.speedUnit}>km/h</Text>
          <Text
            style={[
              styles.modeBadge,
              pedalState === "gas" && styles.modeGas,
              pedalState === "brake" && styles.modeBrake,
            ]}
          >
            {modeLabel}
          </Text>
        </View>
      </View>
    </View>
  );
}
