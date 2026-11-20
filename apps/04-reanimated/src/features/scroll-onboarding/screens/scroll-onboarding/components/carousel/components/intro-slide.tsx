import type { ImageSource } from "expo-image";
import { StyleSheet } from "react-native";
import {
  Extrapolation,
  interpolate,
  type SharedValue,
  useAnimatedStyle,
} from "react-native-reanimated";

import { AnimatedExpoImage } from "@/components/animated-expo-image";

type IntroSlideProps = {
  source: ImageSource;
  index: number;
  scrollProgress: SharedValue<number>;
};

export const IntroSlide = ({ source, index, scrollProgress }: IntroSlideProps) => {
  const animatedStyle = useAnimatedStyle(() => {
    const offset = scrollProgress.get() - index;
    const absOffset = Math.abs(offset);

    const opacity = interpolate(absOffset, [0, 0.75], [1, 0], Extrapolation.CLAMP);
    const scale = interpolate(absOffset, [0, 1], [1, 1.08], Extrapolation.CLAMP);
    const translateX = interpolate(offset, [-1, 0, 1], [-40, 0, 40], Extrapolation.CLAMP);

    return {
      opacity,
      transform: [{ scale }, { translateX }],
    };
  });

  return (
    <AnimatedExpoImage
      source={source}
      style={[styles.introImage, animatedStyle]}
      contentFit="cover"
    />
  );
};

const styles = StyleSheet.create({
  introImage: {
    width: "100%",
    height: "100%",
  },
});
