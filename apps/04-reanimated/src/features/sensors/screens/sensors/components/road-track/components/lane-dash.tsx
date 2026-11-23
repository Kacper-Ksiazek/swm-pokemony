import Animated, { useAnimatedStyle } from "react-native-reanimated";

import { LANE_COUNT } from "../../../constants";
import { DASH_COUNT } from "../road-track.constants";
import { styles } from "../road-track.styles";
import type { LaneDashProps } from "../road-track.types";

export function LaneDash({
  index,
  laneDividerIndex,
  roadWidth,
  roadHeight,
  roadScrollY,
}: LaneDashProps) {
  const step = roadHeight / DASH_COUNT;
  const x = (roadWidth * laneDividerIndex) / LANE_COUNT - 2;

  const animatedStyle = useAnimatedStyle(() => {
    const offset = (roadScrollY.get() * roadHeight + index * step) % roadHeight;
    return {
      transform: [{ translateY: offset - step * 0.5 }],
    };
  });

  return (
    <Animated.View
      style={[
        styles.laneDash,
        {
          left: x,
          height: step * 0.48,
        },
        animatedStyle,
      ]}
    />
  );
}
