import { ActivityIndicator, StyleSheet, View } from "react-native";

import { PressableScale } from "@/shared/components/pressable-scale";
import { COLORS } from "@/shared/styles/colors";

type SavePhotoButtonProps = {
  saving: boolean;
  onPress: () => void;
};

export function SavePhotoButton({ saving, onPress }: SavePhotoButtonProps) {
  return (
    <PressableScale
      pressedScale={0.9}
      accessibilityRole="button"
      accessibilityLabel="Save photo"
      accessibilityState={{ disabled: saving }}
      disabled={saving}
      onPress={onPress}
      style={styles.shutter}
    >
      {saving ? <ActivityIndicator color={COLORS.TEXT} /> : <View style={styles.shutterCore} />}
    </PressableScale>
  );
}

const styles = StyleSheet.create({
  shutter: {
    width: 72,
    height: 72,
    borderRadius: 36,
    borderWidth: 4,
    borderColor: COLORS.BACKGROUND,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "rgba(0, 0, 0, 0.25)",
  },
  shutterCore: {
    width: 54,
    height: 54,
    borderRadius: 27,
    backgroundColor: COLORS.BACKGROUND,
  },
});
