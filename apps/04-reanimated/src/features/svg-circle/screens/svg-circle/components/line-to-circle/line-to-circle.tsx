import { StyleSheet, View } from "react-native";
import Svg, { Path } from "react-native-svg";
import Animated from "react-native-reanimated";

import { DurationBar } from "../duration-bar";

import { useLineToCircleAnimation } from "./hooks/use-line-to-circle-animation";
import {
  CANVAS_SIZE,
  INITIAL_PATH,
  STROKE_COLOR,
  STROKE_WIDTH,
  TIMELINE_SEGMENTS,
  TOTAL_CYCLE_MS,
} from "./line-to-circle.constants";

const AnimatedPath = Animated.createAnimatedComponent(Path);

export function LineToCircle() {
  const { cycle, animatedProps } = useLineToCircleAnimation();

  return (
    <View style={styles.wrapper}>
      <View style={styles.frame}>
        <Svg width={CANVAS_SIZE} height={CANVAS_SIZE} viewBox={`0 0 ${CANVAS_SIZE} ${CANVAS_SIZE}`}>
          <AnimatedPath
            d={INITIAL_PATH}
            animatedProps={animatedProps}
            fill="none"
            stroke={STROKE_COLOR}
            strokeWidth={STROKE_WIDTH}
            strokeLinecap="butt"
            strokeLinejoin="round"
          />
        </Svg>
      </View>

      <DurationBar cycle={cycle} segments={TIMELINE_SEGMENTS} totalMs={TOTAL_CYCLE_MS} />
    </View>
  );
}

const styles = StyleSheet.create({
  wrapper: {
    width: "100%",
    gap: 12,
  },
  frame: {
    width: "100%",
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "#000000",
    borderRadius: 16,
    paddingVertical: 24,
  },
});
