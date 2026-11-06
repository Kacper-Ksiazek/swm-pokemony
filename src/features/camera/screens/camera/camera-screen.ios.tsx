import { openSettings } from "expo-linking";
import { useIsFocused } from "expo-router";
import { useEffect, useRef, useState } from "react";
import { StyleSheet, View, type ViewInstance } from "react-native";
import Animated, {
  runOnJS,
  useAnimatedReaction,
  useAnimatedStyle,
  useSharedValue,
  withSequence,
  withTiming,
} from "react-native-reanimated";
import { SafeAreaView, useSafeAreaInsets } from "react-native-safe-area-context";
import {
  Camera,
  type CameraRef,
  useCameraDevice,
  useCameraPermission,
} from "react-native-vision-camera";

import { pokemonSpriteUrl } from "@/data/pokemon-api";
import { EmptyState } from "@/shared/components/empty-state";
import { ErrorStatusScreen, LoadingStatusScreen } from "@/shared/components/status-screen";
import { useLiveFavoritePokemon } from "@/shared/hooks";
import { COLORS, SPACING } from "@/shared/styles/colors";

import { CameraControls, FlipCameraButton, HeadSticker, StickerPhoto } from "./components";
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

  const { frame, previewWidth, previewHeight, scannerOutput, measurePreview } = useHeadSticker({
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
  const insets = useSafeAreaInsets();
  const flashOpacity = useSharedValue(0);
  const [hasFace, setHasFace] = useState(false);
  const [showFaceHint, setShowFaceHint] = useState(false);

  useAnimatedReaction(
    () => frame.get() != null,
    (present, previous) => {
      if (present !== previous) {
        runOnJS(setHasFace)(present);
      }
    },
  );

  useEffect(() => {
    if (!isFocused || !hasPermission || hasFace) {
      queueMicrotask(() => {
        setShowFaceHint(false);
      });
      return;
    }

    const timer = setTimeout(() => {
      setShowFaceHint(true);
    }, 2000);

    return () => {
      clearTimeout(timer);
    };
  }, [hasFace, hasPermission, isFocused]);

  const flashStyle = useAnimatedStyle(() => ({
    opacity: flashOpacity.get(),
  }));

  function handleSave() {
    if (saving || frame.get() == null) {
      save();
      return;
    }

    flashOpacity.set(
      withSequence(withTiming(0.8, { duration: 90 }), withTiming(0, { duration: 90 })),
    );
    save();
  }

  function flipCamera() {
    frame.set(null);
    setFacing((current) => (current === "front" ? "back" : "front"));
  }

  if (!loaded) {
    return <LoadingStatusScreen message="Loading camera…" />;
  }

  if (favorite === null) {
    return (
      <SafeAreaView style={styles.fill} edges={["top", "bottom"]}>
        <EmptyState
          icon={{ ios: "heart", android: "favorite_border", web: "favorite_border" }}
          title="No favorite yet"
          message="Tap the heart on a Pokémon in the list."
          href="/"
          actionLabel="Open the list"
        />
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
        <View style={[styles.noDeviceFlip, { bottom: insets.bottom + SPACING.xl }]}>
          <FlipCameraButton facing={facing} onPress={flipCamera} />
        </View>
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

      <Animated.View pointerEvents="none" style={[styles.flash, flashStyle]} />
      <CameraControls
        saving={saving}
        status={status}
        showFaceHint={showFaceHint}
        facing={facing}
        onSave={handleSave}
        onFlip={flipCamera}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  fill: {
    flex: 1,
    backgroundColor: COLORS.BACKGROUND,
  },
  preview: {
    flex: 1,
    backgroundColor: "#000000",
  },
  flash: {
    ...StyleSheet.absoluteFill,
    backgroundColor: COLORS.BACKGROUND,
  },
  noDeviceFlip: {
    position: "absolute",
    right: 32,
  },
});
