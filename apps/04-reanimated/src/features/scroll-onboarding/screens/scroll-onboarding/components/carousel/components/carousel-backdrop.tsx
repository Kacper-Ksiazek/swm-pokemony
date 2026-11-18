import { StyleSheet } from "react-native";
import Animated, {
  Extrapolation,
  interpolate,
  type SharedValue,
  useAnimatedStyle,
} from "react-native-reanimated";

import { ONBOARDING_BACKDROP } from "../../../scroll-onboarding-data";

type CarouselBackdropProps = {
  scrollProgress: SharedValue<number>;
  slideCount: number;
};

export const CarouselBackdrop = ({ scrollProgress, slideCount }: CarouselBackdropProps) => {
  const backdropAnimatedStyle = useAnimatedStyle(() => {
    const parallaxX = interpolate(
      scrollProgress.get(),
      [0, slideCount - 1],
      [28, -28],
      Extrapolation.CLAMP,
    );

    return {
      transform: [{ scale: 1.16 }, { translateX: parallaxX }],
    };
  });

  const blurredBackdropAnimatedStyle = useAnimatedStyle(() => {
    const opacity = interpolate(scrollProgress.get(), [0, 0.85], [0, 1], Extrapolation.CLAMP);

    return {
      opacity,
    };
  });

  return (
    <>
      <Animated.Image
        source={ONBOARDING_BACKDROP}
        style={[styles.backdrop, backdropAnimatedStyle]}
        resizeMode="cover"
      />
      <Animated.Image
        source={ONBOARDING_BACKDROP}
        blurRadius={28}
        style={[styles.backdrop, backdropAnimatedStyle, blurredBackdropAnimatedStyle]}
        resizeMode="cover"
      />
    </>
  );
};

const styles = StyleSheet.create({
  backdrop: {
    position: "absolute",
    top: 0,
    left: 0,
    width: "100%",
    height: "100%",
  },
});
