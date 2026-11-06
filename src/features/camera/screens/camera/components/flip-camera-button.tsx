import { SymbolView } from "expo-symbols";
import { StyleSheet } from "react-native";
import Animated, { useAnimatedStyle, useSharedValue, withTiming } from "react-native-reanimated";

import { PressableScale } from "@/shared/components/pressable-scale";
import { COLORS } from "@/shared/styles/colors";

type FlipCameraButtonProps = {
  facing: "front" | "back";
  disabled?: boolean;
  onPress: () => void;
};

export function FlipCameraButton({ facing, disabled = false, onPress }: FlipCameraButtonProps) {
  const rotation = useSharedValue(0);

  const iconStyle = useAnimatedStyle(() => ({
    transform: [{ rotate: `${rotation.get()}deg` }],
  }));

  function handlePress() {
    rotation.set(withTiming(rotation.get() + 180, { duration: 280 }));
    onPress();
  }

  return (
    <PressableScale
      pressedScale={0.9}
      accessibilityRole="button"
      accessibilityLabel={facing === "front" ? "Use back camera" : "Use front camera"}
      accessibilityState={{ disabled }}
      disabled={disabled}
      onPress={handlePress}
      style={styles.button}
    >
      <Animated.View style={iconStyle}>
        <SymbolView
          name={{
            ios: "arrow.triangle.2.circlepath.camera",
            android: "flip_camera_android",
            web: "flip_camera_android",
          }}
          size={22}
          tintColor={COLORS.BACKGROUND}
        />
      </Animated.View>
    </PressableScale>
  );
}

const styles = StyleSheet.create({
  button: {
    width: 48,
    height: 48,
    borderRadius: 24,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "rgba(0, 0, 0, 0.45)",
  },
});
