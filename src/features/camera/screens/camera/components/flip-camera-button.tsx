import { SymbolView } from "expo-symbols";
import { Pressable, StyleSheet } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";

type FlipCameraButtonProps = {
  facing: "front" | "back";
  disabled?: boolean;
  onPress: () => void;
};

export function FlipCameraButton({ facing, disabled = false, onPress }: FlipCameraButtonProps) {
  const insets = useSafeAreaInsets();

  return (
    <Pressable
      accessibilityRole="button"
      accessibilityLabel={facing === "front" ? "Use back camera" : "Use front camera"}
      accessibilityState={{ disabled }}
      disabled={disabled}
      onPress={onPress}
      style={[styles.button, { bottom: insets.bottom + 24 }]}
    >
      <SymbolView
        name={{
          ios: "arrow.triangle.2.circlepath.camera",
          android: "flip_camera_android",
          web: "flip_camera_android",
        }}
        size={22}
        tintColor="#ffffff"
      />
    </Pressable>
  );
}

const styles = StyleSheet.create({
  button: {
    position: "absolute",
    right: 32,
    width: 48,
    height: 48,
    borderRadius: 24,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "rgba(0, 0, 0, 0.45)",
  },
});
