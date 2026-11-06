import { Image } from "expo-image";
import { StyleSheet } from "react-native";
import Animated, { type SharedValue, useAnimatedStyle } from "react-native-reanimated";

import type { HeadStickerFrame } from "../sticker-frame.types";

type HeadStickerProps = {
  uri: string;
  frame: SharedValue<HeadStickerFrame | null>;
  previewWidth: SharedValue<number>;
  previewHeight: SharedValue<number>;
};

export function HeadSticker({ uri, frame, previewWidth, previewHeight }: HeadStickerProps) {
  const animatedStyle = useAnimatedStyle(() => {
    const current = frame.get();
    const width = previewWidth.get();

    if (current == null || width <= 0) {
      return { opacity: 0, width: 0, height: 0 };
    }

    const size = current.size * width;

    return {
      opacity: 1,
      left: current.left * width,
      top: current.top * previewHeight.get(),
      width: size,
      height: size,
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
