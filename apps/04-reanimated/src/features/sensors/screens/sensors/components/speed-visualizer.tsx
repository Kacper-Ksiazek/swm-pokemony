import { StyleSheet, Text, View } from "react-native";
import Animated, {
  interpolateColor,
  type SharedValue,
  useAnimatedProps,
} from "react-native-reanimated";
import Svg, { Path } from "react-native-svg";

import { monoFont } from "@/components/demo-screen";
import { theme } from "@/components/theme";

import { MAX_SPEED_KMH, MIN_SPEED_KMH } from "../sensors.constants";
import type { PedalState } from "../sensors.types";

const AnimatedPath = Animated.createAnimatedComponent(Path);

const SIZE = 112;
const CX = SIZE / 2;
const CY = SIZE / 2 + 4;
const RADIUS = 42;
const STROKE_WIDTH = 9;
const START_ANGLE_DEG = 150;
const SWEEP_DEG = 240;

function polarToCartesian(cx: number, cy: number, r: number, angleDeg: number) {
  "worklet";

  const rad = (angleDeg * Math.PI) / 180;
  return {
    x: cx + r * Math.cos(rad),
    y: cy + r * Math.sin(rad),
  };
}

function describeArc(cx: number, cy: number, r: number, startAngle: number, endAngle: number) {
  "worklet";

  const start = polarToCartesian(cx, cy, r, startAngle);
  const end = polarToCartesian(cx, cy, r, endAngle);
  const sweep = endAngle - startAngle;
  const largeArcFlag = sweep <= 180 ? "0" : "1";

  return `M ${start.x.toFixed(2)} ${start.y.toFixed(2)} A ${r} ${r} 0 ${largeArcFlag} 1 ${end.x.toFixed(2)} ${end.y.toFixed(2)}`;
}

const TRACK_PATH = describeArc(CX, CY, RADIUS, START_ANGLE_DEG, START_ANGLE_DEG + SWEEP_DEG);
const INITIAL_ARC_PATH = describeArc(CX, CY, RADIUS, START_ANGLE_DEG, START_ANGLE_DEG + 48);

type SpeedVisualizerProps = {
  speedKmh: number;
  pedalState: PedalState;
  liveSpeedKmh: SharedValue<number>;
};

export function SpeedVisualizer({ speedKmh, pedalState, liveSpeedKmh }: SpeedVisualizerProps) {
  const animatedProps = useAnimatedProps(() => {
    const ratio = Math.max(
      0.02,
      Math.min(1, (liveSpeedKmh.get() - MIN_SPEED_KMH) / (MAX_SPEED_KMH - MIN_SPEED_KMH)),
    );
    const endAngle = START_ANGLE_DEG + SWEEP_DEG * ratio;
    const stroke = interpolateColor(ratio, [0, 0.5, 1], ["#16A34A", "#EA580C", "#E3350D"]);

    return {
      d: describeArc(CX, CY, RADIUS, START_ANGLE_DEG, endAngle),
      stroke,
    };
  });

  const modeLabel = pedalState === "gas" ? "GAZ" : pedalState === "brake" ? "HAMULEC" : "TEMPOMAT";

  return (
    <View style={styles.card}>
      <View style={styles.gaugeWrapper}>
        <Svg width={SIZE} height={SIZE} viewBox={`0 0 ${SIZE} ${SIZE}`}>
          <Path
            d={TRACK_PATH}
            fill="none"
            stroke="#E4E4E7"
            strokeWidth={STROKE_WIDTH}
            strokeLinecap="round"
          />
          <AnimatedPath
            d={INITIAL_ARC_PATH}
            animatedProps={animatedProps}
            fill="none"
            stroke="#16A34A"
            strokeWidth={STROKE_WIDTH}
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

const styles = StyleSheet.create({
  card: {
    backgroundColor: theme.colors.card,
    borderWidth: 1,
    borderColor: theme.colors.cardBorder,
    borderRadius: theme.radius.md,
    paddingVertical: 6,
    paddingHorizontal: 8,
    alignItems: "center",
  },
  gaugeWrapper: {
    width: SIZE,
    height: SIZE,
    alignItems: "center",
    justifyContent: "center",
  },
  centerReadout: {
    position: "absolute",
    alignItems: "center",
    justifyContent: "center",
    paddingTop: 6,
  },
  speedValue: {
    fontSize: 22,
    fontWeight: "900",
    color: theme.colors.textPrimary,
    fontFamily: monoFont,
    fontVariant: ["tabular-nums"],
    lineHeight: 24,
  },
  speedUnit: {
    fontSize: 9,
    fontWeight: "700",
    color: theme.colors.textSecondary,
    fontFamily: monoFont,
  },
  modeBadge: {
    marginTop: 3,
    fontSize: 8,
    fontWeight: "800",
    color: theme.colors.textSecondary,
    fontFamily: monoFont,
  },
  modeGas: {
    color: theme.colors.success,
  },
  modeBrake: {
    color: theme.colors.accent,
  },
});
