import { ActivityIndicator, Pressable, StyleSheet, Text, View } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";

type SavePhotoButtonProps = {
  saving: boolean;
  status: string | null;
  onPress: () => void;
};

export function SavePhotoButton({ saving, status, onPress }: SavePhotoButtonProps) {
  const insets = useSafeAreaInsets();

  return (
    <View pointerEvents="box-none" style={[styles.bar, { bottom: insets.bottom + 16 }]}>
      {status != null ? <Text style={styles.status}>{status}</Text> : null}

      <Pressable
        accessibilityRole="button"
        accessibilityLabel="Save photo"
        accessibilityState={{ disabled: saving }}
        disabled={saving}
        onPress={onPress}
        style={styles.shutter}
      >
        {saving ? <ActivityIndicator color="#111111" /> : <View style={styles.shutterCore} />}
      </Pressable>
    </View>
  );
}

const styles = StyleSheet.create({
  bar: {
    position: "absolute",
    left: 0,
    right: 0,
    alignItems: "center",
    gap: 12,
  },
  status: {
    color: "#ffffff",
    fontSize: 14,
    fontWeight: "600",
    textAlign: "center",
    paddingHorizontal: 24,
    textShadowColor: "rgba(0, 0, 0, 0.8)",
    textShadowOffset: { width: 0, height: 1 },
    textShadowRadius: 4,
  },
  shutter: {
    width: 72,
    height: 72,
    borderRadius: 36,
    borderWidth: 4,
    borderColor: "#ffffff",
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "rgba(0, 0, 0, 0.25)",
  },
  shutterCore: {
    width: 54,
    height: 54,
    borderRadius: 27,
    backgroundColor: "#ffffff",
  },
});
