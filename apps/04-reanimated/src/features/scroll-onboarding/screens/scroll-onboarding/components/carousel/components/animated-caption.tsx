import { StyleSheet } from "react-native";
import Animated, {
  Extrapolation,
  interpolate,
  type SharedValue,
  useAnimatedStyle,
} from "react-native-reanimated";

type AnimatedCaptionProps = {
  caption: string;
  index: number;
  scrollProgress: SharedValue<number>;
};

export const AnimatedCaption = ({ caption, index, scrollProgress }: AnimatedCaptionProps) => {
  const animatedStyle = useAnimatedStyle(() => {
    const offset = scrollProgress.get() - index;
    const absOffset = Math.abs(offset);

    const opacity = interpolate(absOffset, [0, 0.55], [1, 0], Extrapolation.CLAMP);
    const translateY = interpolate(offset, [-1, 0, 1], [-18, 0, 18], Extrapolation.CLAMP);
    const scale = interpolate(absOffset, [0, 0.6], [1, 0.94], Extrapolation.CLAMP);

    return {
      opacity,
      transform: [{ translateY }, { scale }],
    };
  });

  return (
    <Animated.Text style={[styles.caption, animatedStyle]} pointerEvents="none">
      {caption}
    </Animated.Text>
  );
};

const styles = StyleSheet.create({
  caption: {
    position: "absolute",
    left: 0,
    right: 0,
    paddingHorizontal: 24,
    color: "#ffffff",
    fontSize: 32,
    fontWeight: "700",
    textAlign: "center",
  },
});
