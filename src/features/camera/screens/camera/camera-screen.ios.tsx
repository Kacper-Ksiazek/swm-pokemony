import { openSettings } from "expo-linking";
import { useIsFocused } from "expo-router";
import { StyleSheet, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { Camera, useCameraDevice, useCameraPermission } from "react-native-vision-camera";

import { EmptyState } from "@/shared/components/empty-state";
import { ErrorStatusScreen } from "@/shared/components/status-screen";
import { useLiveFavoritePokemon } from "@/shared/hooks";

export function CameraScreen() {
  const isFocused = useIsFocused();
  const { favorite, loaded } = useLiveFavoritePokemon();
  const { hasPermission, canRequestPermission, requestPermission } = useCameraPermission();
  const device = useCameraDevice("front");

  if (!loaded) {
    return <View style={styles.fill} />;
  }

  if (favorite === null) {
    return (
      <SafeAreaView style={styles.fill} edges={["top", "bottom"]}>
        <EmptyState message="No favorite yet. Tap the heart on a Pokémon in the list." />
      </SafeAreaView>
    );
  }

  if (!hasPermission) {
    return (
      <SafeAreaView style={styles.fill} edges={["top", "bottom"]}>
        <ErrorStatusScreen
          title={canRequestPermission ? "Camera access is needed" : "Camera access is off"}
          message="Allow camera access to use this tab."
          retryLabel={canRequestPermission ? "Allow camera" : "Open Settings"}
          onRetry={() => {
            if (canRequestPermission) {
              requestPermission();
              return;
            }

            openSettings();
          }}
        />
      </SafeAreaView>
    );
  }

  if (device == null) {
    return (
      <SafeAreaView style={styles.fill} edges={["top", "bottom"]}>
        <EmptyState message="This device has no front camera." />
      </SafeAreaView>
    );
  }

  return <Camera style={styles.preview} device={device} isActive={isFocused} />;
}

const styles = StyleSheet.create({
  fill: {
    flex: 1,
    backgroundColor: "#ffffff",
  },
  preview: {
    flex: 1,
    backgroundColor: "#000000",
  },
});
