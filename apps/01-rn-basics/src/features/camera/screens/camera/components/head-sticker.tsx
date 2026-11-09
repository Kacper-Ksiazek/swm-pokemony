import { Image } from "expo-image";
import { StyleSheet } from "react-native";
import Animated, {
  type SharedValue,
  useAnimatedReaction,
  useAnimatedStyle,
  useSharedValue,
  withSpring,
} from "react-native-reanimated";

import type { HeadStickerFrame } from "../sticker-frame.types";

type HeadStickerProps = {
  uri: string;
  frame: SharedValue<HeadStickerFrame | null>;
  previewWidth: SharedValue<number>;
  previewHeight: SharedValue<number>;
};

export function HeadSticker({ uri, frame, previewWidth, previewHeight }: HeadStickerProps) {
  const intro = useSharedValue(0);

  useAnimatedReaction(
    () => frame.get() != null,
    (visible, previous) => {
      if (visible && previous !== true) {
        intro.set(0);
        intro.set(withSpring(1, { damping: 14, stiffness: 220 }));
        return;
      }

      if (!visible) {
        intro.set(0);
      }
    },
  );

  const animatedStyle = useAnimatedStyle(() => {
    const current = frame.get();
    const width = previewWidth.get();

    if (current == null || width <= 0) {
      return { opacity: 0, width: 0, height: 0 };
    }

    const size = current.size * width;
    const scale = 0.6 + 0.4 * intro.get();

    return {
      opacity: 1,
      left: current.left * width,
      top: current.top * previewHeight.get(),
      width: size,
      height: size,
      transform: [{ scale }],
    };
  });

  return (
    <Animated.View pointerEvents="none" style={[styles.sticker, animatedStyle]}>
      <Image source={{ uri }} style={styles.image} contentFit="contain" />
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  sticker: {
    position: "absolute",
  },
  image: {
    width: "100%",
    height: "100%",
  },
});
