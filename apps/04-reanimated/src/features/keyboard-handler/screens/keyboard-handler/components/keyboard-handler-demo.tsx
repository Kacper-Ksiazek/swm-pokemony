import { useState } from "react";
import { Pressable, StyleSheet, Text, TextInput, View } from "react-native";
import { KeyboardController, useKeyboardHandler } from "react-native-keyboard-controller";
import Animated, {
  interpolateColor,
  useAnimatedStyle,
  useSharedValue,
} from "react-native-reanimated";
import { useSafeAreaInsets } from "react-native-safe-area-context";

import { theme } from "@/components/theme";

import { ApiCodeBlock } from "./api-code-block";

const KEYBOARD_HANDLER_API = [
  { api: "useKeyboardHandler", detail: "onStart · onMove · onInteractive · onEnd" },
  { api: "KeyboardController.dismiss()" },
] as const;

export function KeyboardHandlerDemo() {
  const [text, setText] = useState("");
  const insets = useSafeAreaInsets();

  const keyboardHeight = useSharedValue(0);
  const keyboardProgress = useSharedValue(0);
  const figureHeight = useSharedValue(116);

  const containerBottomPadding = Math.max(insets.bottom, 16);

  useKeyboardHandler(
    {
      onStart: (event) => {
        "worklet";

        keyboardProgress.set(event.progress);
      },
      onMove: (event) => {
        "worklet";

        keyboardHeight.set(event.height);
        keyboardProgress.set(event.progress);
      },
      onInteractive: (event) => {
        "worklet";

        keyboardHeight.set(event.height);
        keyboardProgress.set(event.progress);
      },
      onEnd: (event) => {
        "worklet";

        keyboardHeight.set(event.height);
        keyboardProgress.set(event.progress);
      },
    },
    [],
  );

  const inputRowAnimatedStyle = useAnimatedStyle(() => {
    const restingBottom = 32 + containerBottomPadding + 12 + figureHeight.get();
    const lift = Math.max(0, keyboardHeight.get() - restingBottom + 10);

    return {
      transform: [{ translateY: -lift }],
    };
  });

  const inputBoxAnimatedStyle = useAnimatedStyle(() => ({
    borderColor: interpolateColor(
      keyboardProgress.get(),
      [0, 1],
      [theme.colors.cardBorder, theme.colors.accent],
    ),
  }));

  const progressFillAnimatedStyle = useAnimatedStyle(() => ({
    transform: [{ scaleX: keyboardProgress.get() }],
  }));

  return (
    <View style={[styles.container, { paddingBottom: containerBottomPadding }]}>
      <View style={styles.infoCard}>
        <Text style={styles.eyebrow}>1 · useKeyboardHandler</Text>

        <ApiCodeBlock items={KEYBOARD_HANDLER_API} />

        <View style={styles.progressTrack}>
          <Animated.View style={[styles.progressFill, progressFillAnimatedStyle]} />
        </View>
      </View>

      <View style={styles.spacer} />

      <Animated.View style={[styles.inputWrapper, inputRowAnimatedStyle]}>
        <Animated.View style={[styles.inputRow, inputBoxAnimatedStyle]}>
          <TextInput
            value={text}
            onChangeText={setText}
            placeholder="Tap to animate above the keyboard…"
            placeholderTextColor={theme.colors.textMuted}
            style={styles.input}
          />

          <Pressable onPress={() => KeyboardController.dismiss()} style={styles.dismissButton}>
            <Text style={styles.dismissLabel}>Hide</Text>
          </Pressable>
        </Animated.View>
      </Animated.View>

      <View
        onLayout={(event) => {
          figureHeight.set(event.nativeEvent.layout.height);
        }}
        style={styles.staticFigureCard}
      >
        <View style={styles.pokeball}>
          <View style={styles.pokeballTop} />
          <View style={styles.pokeballBand} />
          <View style={styles.pokeballCenter} />
        </View>

        <Text style={styles.figureCaption}>Static figure (covered when keyboard opens)</Text>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    paddingHorizontal: 20,
    gap: 12,
  },
  infoCard: {
    backgroundColor: theme.colors.card,
    borderWidth: 1,
    borderColor: theme.colors.cardBorder,
    borderRadius: theme.radius.lg,
    padding: 14,
    gap: 8,
  },
  eyebrow: {
    fontSize: 12,
    fontWeight: "700",
    letterSpacing: 0.6,
    textTransform: "uppercase",
    color: theme.colors.accent,
  },
  progressTrack: {
    height: 4,
    borderRadius: 2,
    backgroundColor: theme.colors.cardBorder,
    overflow: "hidden",
  },
  progressFill: {
    height: "100%",
    width: "100%",
    backgroundColor: theme.colors.accent,
    transformOrigin: "left",
  },
  spacer: {
    flex: 1,
  },
  inputWrapper: {
    zIndex: 2,
  },
  inputRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    backgroundColor: theme.colors.surface,
    borderWidth: 1.5,
    borderRadius: theme.radius.md,
    paddingHorizontal: 12,
    paddingVertical: 10,
  },
  input: {
    flex: 1,
    fontSize: 15,
    color: theme.colors.textPrimary,
    padding: 0,
  },
  dismissButton: {
    backgroundColor: theme.colors.pillBg,
    borderRadius: theme.radius.sm,
    paddingHorizontal: 10,
    paddingVertical: 6,
  },
  dismissLabel: {
    fontSize: 12,
    fontWeight: "600",
    color: theme.colors.pillText,
  },
  staticFigureCard: {
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: theme.colors.card,
    borderWidth: 1,
    borderColor: theme.colors.cardBorder,
    borderRadius: theme.radius.lg,
    paddingVertical: 18,
    gap: 10,
  },
  pokeball: {
    width: 56,
    height: 56,
    borderRadius: 28,
    borderWidth: 3,
    borderColor: theme.colors.textPrimary,
    backgroundColor: theme.colors.surface,
    overflow: "hidden",
    alignItems: "center",
    justifyContent: "center",
  },
  pokeballTop: {
    position: "absolute",
    top: 0,
    left: 0,
    right: 0,
    height: "50%",
    backgroundColor: theme.colors.accent,
  },
  pokeballBand: {
    position: "absolute",
    left: 0,
    right: 0,
    height: 4,
    backgroundColor: theme.colors.textPrimary,
  },
  pokeballCenter: {
    width: 16,
    height: 16,
    borderRadius: 8,
    borderWidth: 3,
    borderColor: theme.colors.textPrimary,
    backgroundColor: theme.colors.surface,
  },
  figureCaption: {
    fontSize: 12,
    color: theme.colors.textMuted,
  },
});
