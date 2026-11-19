import Animated, { useAnimatedStyle } from "react-native-reanimated";

import { theme } from "@/components/theme";

import { CURB_STRIPE_COUNT } from "../road-track.constants";
import { styles } from "../road-track.styles";
import type { CurbStripeProps } from "../road-track.types";

export function CurbStripe({ index, side, roadHeight, roadScrollY }: CurbStripeProps) {
  const step = roadHeight / CURB_STRIPE_COUNT;
  const isRed = index % 2 === 0;

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
          backgroundColor: isRed ? theme.colors.accent : "#F4F4F5",
        },
        animatedStyle,
      ]}
    />
  );
}
