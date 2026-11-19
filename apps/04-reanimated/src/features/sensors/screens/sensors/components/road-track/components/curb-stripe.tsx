import Animated, { useAnimatedStyle } from "react-native-reanimated";

import { VICE_COLORS } from "../../../constants";
import { CURB_STRIPE_COUNT } from "../road-track.constants";
import { styles } from "../road-track.styles";
import type { CurbStripeProps } from "../road-track.types";

export function CurbStripe({ index, side, roadHeight, roadScrollY }: CurbStripeProps) {
  const step = roadHeight / CURB_STRIPE_COUNT;
  const isPink = index % 2 === 0;

  const animatedStyle = useAnimatedStyle(() => {
    const offset = (roadScrollY.get() * roadHeight + index * step) % roadHeight;
    return {
      transform: [{ translateY: offset - step }],
    };
  });

  return (
    <Animated.View
      style={[
        styles.curbStripe,
        side === "left" ? styles.curbLeft : styles.curbRight,
        {
          height: step + 1,
          backgroundColor: isPink ? VICE_COLORS.pink : VICE_COLORS.cyan,
        },
        animatedStyle,
      ]}
    />
  );
}
