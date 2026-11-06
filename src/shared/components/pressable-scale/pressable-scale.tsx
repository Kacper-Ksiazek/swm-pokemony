import { forwardRef } from "react";
import {
  Pressable,
  type PressableProps,
  type StyleProp,
  type View,
  type ViewStyle,
} from "react-native";
import Animated, {
  useAnimatedStyle,
  useReducedMotion,
  useSharedValue,
  withSpring,
} from "react-native-reanimated";

const AnimatedPressable = Animated.createAnimatedComponent(Pressable);

type PressableScaleProps = Omit<PressableProps, "style"> & {
  pressedScale?: number;
  style?: StyleProp<ViewStyle>;
};

export const PressableScale = forwardRef<View, PressableScaleProps>(function PressableScale(
  { pressedScale = 0.97, onPressIn, onPressOut, style, ...rest },
  ref,
) {
  const reducedMotion = useReducedMotion();
  const scale = useSharedValue(1);

  const animatedStyle = useAnimatedStyle(() => ({
    transform: [{ scale: scale.get() }],
  }));

  return (
    <AnimatedPressable
      ref={ref as never}
      onPressIn={(event) => {
        if (!reducedMotion) {
          scale.set(withSpring(pressedScale, { damping: 20, stiffness: 420 }));
        }
        onPressIn?.(event);
      }}
      onPressOut={(event) => {
        if (!reducedMotion) {
          scale.set(withSpring(1, { damping: 16, stiffness: 260 }));
        }
        onPressOut?.(event);
      }}
      style={[style, animatedStyle]}
      {...rest}
    />
  );
});
