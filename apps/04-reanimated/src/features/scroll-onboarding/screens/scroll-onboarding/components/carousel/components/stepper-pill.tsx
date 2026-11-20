import { Pressable, StyleSheet } from "react-native";
import Animated, {
  Extrapolation,
  interpolate,
  interpolateColor,
  type SharedValue,
  useAnimatedStyle,
} from "react-native-reanimated";

type StepperPillProps = {
  index: number;
  scrollProgress: SharedValue<number>;
  onPress: (index: number) => void;
};

export const StepperPill = ({ index, scrollProgress, onPress }: StepperPillProps) => {
  const pillStyle = useAnimatedStyle(() => {
    const absOffset = Math.abs(scrollProgress.get() - index);

    const width = interpolate(absOffset, [0, 1], [36, 12], Extrapolation.CLAMP);
    const opacity = interpolate(absOffset, [0, 1], [1, 0.5], Extrapolation.CLAMP);
    const backgroundColor = interpolateColor(absOffset, [0, 1], ["#FFFFFF", "#8E8E93"]);

    return {
      width,
      opacity,
      backgroundColor,
    };
  });

  return (
    <Pressable hitSlop={{ top: 16, bottom: 16, left: 6, right: 6 }} onPress={() => onPress(index)}>
      <Animated.View style={[styles.stepperItem, pillStyle]} />
    </Pressable>
  );
};

const styles = StyleSheet.create({
  stepperItem: {
    height: 6,
    borderRadius: 5,
    backgroundColor: "#8E8E93",
  },
});
