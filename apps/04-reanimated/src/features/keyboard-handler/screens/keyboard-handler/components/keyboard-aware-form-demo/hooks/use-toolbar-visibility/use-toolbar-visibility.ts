import { useKeyboardHandler } from "react-native-keyboard-controller";
import {
  interpolate,
  useAnimatedStyle,
  useSharedValue,
  withDelay,
  withTiming,
} from "react-native-reanimated";

/** Drives toolbar fade/slide from keyboard open/close progress events. */
export function useToolbarVisibility() {
  const toolbarVisibility = useSharedValue(0);

  useKeyboardHandler(
    {
      onStart: (event) => {
        "worklet";

        if (event.progress === 1) {
          toolbarVisibility.set(withDelay(140, withTiming(1, { duration: 180 })));
        } else {
          toolbarVisibility.set(withTiming(0, { duration: 130 }));
        }
      },
      onEnd: (event) => {
        "worklet";

        toolbarVisibility.set(withTiming(event.progress, { duration: 120 }));
      },
    },
    [],
  );

  const toolbarAnimatedStyle = useAnimatedStyle(() => {
    const progress = toolbarVisibility.get();

    return {
      opacity: progress,
      transform: [
        { translateY: interpolate(progress, [0, 1], [10, 0]) },
        { scale: interpolate(progress, [0, 1], [0.96, 1]) },
      ],
    };
  });

  return { toolbarAnimatedStyle };
}
