import { openSettings } from "expo-linking";
import { useIsFocused } from "expo-router";
import { useRef, useState } from "react";
import { StyleSheet, View, type ViewInstance } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import {
  Camera,
  type CameraRef,
  useCameraDevice,
  useCameraPermission,
} from "react-native-vision-camera";

import { pokemonSpriteUrl } from "@/data/pokemon-api";
import { EmptyState } from "@/shared/components/empty-state";
import { ErrorStatusScreen } from "@/shared/components/status-screen";
import { useLiveFavoritePokemon } from "@/shared/hooks";

import { FlipCameraButton, HeadSticker, SavePhotoButton, StickerPhoto } from "./components";
import { FaceScanStatus } from "./devtools";
import { useHeadSticker, useSaveStickerPhoto } from "./hooks";

type CameraFacing = "front" | "back";

export function CameraScreen() {
  const isFocused = useIsFocused();

  const { favorite, loaded } = useLiveFavoritePokemon();
  const { hasPermission, canRequestPermission, requestPermission } = useCameraPermission();

  const [facing, setFacing] = useState<CameraFacing>("front");
  const frontDevice = useCameraDevice("front");
  const backDevice = useCameraDevice("back");
  const device = facing === "back" ? backDevice : frontDevice;
  const cameraRef = useRef<CameraRef>(null);
  const previewRef = useRef<ViewInstance>(null);
  const [previewSize, setPreviewSize] = useState({ width: 0, height: 0 });

  const { frame, previewWidth, previewHeight, scannerOutput, measurePreview, debug } =
    useHeadSticker({
      cameraRef,
      previewRef,
      isFocused,
    });

  const {
    photoOutput,
    shotRef,
    pending,
    saving,
    status,
    save,
    onCompositionReady,
    onCompositionFailed,
  } = useSaveStickerPhoto({
    frame,
    previewWidth,
    previewHeight,
    previewSize,
    facing,
  });

  const spriteUri = favorite == null ? "" : pokemonSpriteUrl(favorite.id);

  function flipCamera() {
    frame.set(null);
    setFacing((current) => (current === "front" ? "back" : "front"));
  }

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
      <View style={styles.fill}>
        <EmptyState
          message={
            facing === "front"
              ? "This device has no front camera."
              : "This device has no back camera."
          }
        />
        <FlipCameraButton facing={facing} onPress={flipCamera} />
      </View>
    );
  }

  return (
    <View
      ref={previewRef}
      style={styles.preview}
      onLayout={(event) => {
        const { width, height } = event.nativeEvent.layout;
        setPreviewSize((current) =>
          current.width === width && current.height === height ? current : { width, height },
        );
        measurePreview();
      }}
    >
      <Camera
        ref={cameraRef}
        style={StyleSheet.absoluteFill}
        device={device}
        isActive={isFocused}
        outputs={[scannerOutput, photoOutput]}
      />
      <HeadSticker
        uri={spriteUri}
        frame={frame}
        previewWidth={previewWidth}
        previewHeight={previewHeight}
      />
      {__DEV__ ? <FaceScanStatus status={debug} scannerReady /> : null}

      {pending != null ? (
        <StickerPhoto
          shotRef={shotRef}
          photoUri={pending.uri}
          spriteUri={spriteUri}
          frame={pending.frame}
          width={pending.width}
          height={pending.height}
          mirror={pending.mirror}
          onReady={onCompositionReady}
          onFailed={onCompositionFailed}
        />
      ) : null}

      <SavePhotoButton saving={saving} status={status} onPress={save} />
      <FlipCameraButton facing={facing} disabled={saving} onPress={flipCamera} />
    </View>
  );
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
