import { type RefObject, useRef } from "react";
import { Image, StyleSheet, View } from "react-native";
import ViewShot, { type ViewShotRef } from "react-native-view-shot";

import type { HeadStickerFrame } from "../sticker-frame.types";

type StickerPhotoProps = {
  shotRef: RefObject<ViewShotRef | null>;
  photoUri: string;
  spriteUri: string;
  frame: HeadStickerFrame;
  width: number;
  height: number;
  mirror: boolean;
  onReady: () => void;
  onFailed: () => void;
};

export function StickerPhoto({
  shotRef,
  photoUri,
  spriteUri,
  frame,
  width,
  height,
  mirror,
  onReady,
  onFailed,
}: StickerPhotoProps) {
  const finished = useRef(false);
  const remaining = useRef(2);
  const stickerSize = frame.size * width;
  const stickerLeft = mirror ? width - frame.left * width - stickerSize : frame.left * width;

  function markLoaded() {
    remaining.current -= 1;
    if (remaining.current > 0 || finished.current) {
      return;
    }

    finished.current = true;
    onReady();
  }

  function markFailed() {
    if (finished.current) {
      return;
    }

    finished.current = true;
    onFailed();
  }

  return (
    <View pointerEvents="none" collapsable={false} style={[styles.hidden, { width, height }]}>
      <ViewShot
        ref={shotRef}
        style={{ width, height }}
        options={{ format: "jpg", quality: 0.92, result: "tmpfile", useRenderInContext: true }}
      >
        <Image
          source={{ uri: photoUri }}
          style={[styles.photo, mirror ? styles.unmirror : null]}
          resizeMode="cover"
          fadeDuration={0}
          onLoad={markLoaded}
          onError={markFailed}
        />
        <Image
          source={{ uri: spriteUri }}
          fadeDuration={0}
          resizeMode="contain"
          style={[
            styles.sprite,
            {
              left: stickerLeft,
              top: frame.top * height,
              width: stickerSize,
              height: stickerSize,
            },
          ]}
          onLoad={markLoaded}
          onError={markFailed}
        />
      </ViewShot>
    </View>
  );
}

const styles = StyleSheet.create({
  hidden: {
    position: "absolute",
    left: -10000,
    top: 0,
    backgroundColor: "#000000",
  },
  photo: {
    width: "100%",
    height: "100%",
  },
  unmirror: {
    transform: [{ scaleX: -1 }],
  },
  sprite: {
    position: "absolute",
  },
});
