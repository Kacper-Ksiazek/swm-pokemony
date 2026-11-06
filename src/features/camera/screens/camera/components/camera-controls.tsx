import { StyleSheet, Text, View } from "react-native";
import Animated, { FadeIn, FadeOut } from "react-native-reanimated";
import { useSafeAreaInsets } from "react-native-safe-area-context";

import { COLORS, RADIUS, SPACING } from "@/shared/styles/colors";

import { FlipCameraButton } from "./flip-camera-button";
import { SavePhotoButton } from "./save-photo-button";

type CameraControlsProps = {
  saving: boolean;
  status: string | null;
  showFaceHint: boolean;
  facing: "front" | "back";
  onSave: () => void;
  onFlip: () => void;
};

export function CameraControls({
  saving,
  status,
  showFaceHint,
  facing,
  onSave,
  onFlip,
}: CameraControlsProps) {
  const insets = useSafeAreaInsets();

  return (
    <View pointerEvents="box-none" style={[styles.wrap, { bottom: insets.bottom + SPACING.lg }]}>
      {showFaceHint ? (
        <Animated.View
          entering={FadeIn.duration(180)}
          exiting={FadeOut.duration(180)}
          style={styles.pill}
        >
          <Text style={styles.pillText}>Point the camera at your face</Text>
        </Animated.View>
      ) : null}

      {status != null ? (
        <Animated.View
          key={status}
          entering={FadeIn.duration(180)}
          exiting={FadeOut.duration(180)}
          style={styles.pill}
        >
          <Text style={styles.pillText}>{status}</Text>
        </Animated.View>
      ) : null}

      <View style={styles.row}>
        <View style={styles.side} />
        <SavePhotoButton saving={saving} onPress={onSave} />
        <View style={[styles.side, styles.flipSlot]}>
          <FlipCameraButton facing={facing} disabled={saving} onPress={onFlip} />
        </View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  wrap: {
    position: "absolute",
    left: 0,
    right: 0,
    alignItems: "center",
    gap: SPACING.md,
  },
  pill: {
    paddingHorizontal: SPACING.lg,
    paddingVertical: SPACING.sm,
    borderRadius: RADIUS.pill,
    backgroundColor: "rgba(0, 0, 0, 0.55)",
  },
  pillText: {
    color: COLORS.BACKGROUND,
    fontSize: 14,
    fontWeight: "600",
    textAlign: "center",
  },
  row: {
    alignSelf: "stretch",
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
  },
  side: {
    width: 72,
  },
  flipSlot: {
    alignItems: "flex-end",
    paddingRight: SPACING.lg,
  },
});
