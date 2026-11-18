import { useState } from "react";
import { Pressable, StyleSheet, Text, View } from "react-native";
import { GestureDetector } from "react-native-gesture-handler";
import Animated from "react-native-reanimated";

import { DemoScreen, monoFont } from "@/components/demo-screen";
import { theme } from "@/components/theme";

import { TelemetryPanel } from "./components/telemetry-panel";
import { BALL_SIZE, type PhysicsMode, usePhysicsBall } from "./hooks/use-physics-ball";

export function PhysicsBallScreen() {
  const [mode, setMode] = useState<PhysicsMode>("decay");
  const { telemetry, panGesture, ballAnimatedStyle, handleArenaLayout, reset } =
    usePhysicsBall(mode);

  return (
    <DemoScreen scroll={false}>
      <View style={styles.modeRow}>
        <Pressable
          onPress={() => setMode("decay")}
          style={[styles.modeChip, mode === "decay" && styles.modeChipSelected]}
        >
          <Text style={[styles.modeText, mode === "decay" && styles.modeTextSelected]}>
            withDecay + reaction
          </Text>
        </Pressable>

        <Pressable
          onPress={() => setMode("frameCallback")}
          style={[styles.modeChip, mode === "frameCallback" && styles.modeChipSelected]}
        >
          <Text style={[styles.modeText, mode === "frameCallback" && styles.modeTextSelected]}>
            useFrameCallback
          </Text>
        </Pressable>
      </View>

      <GestureDetector gesture={panGesture}>
        <View style={styles.arena} onLayout={handleArenaLayout}>
          <View style={styles.centerCrosshairH} pointerEvents="none" />
          <View style={styles.centerCrosshairV} pointerEvents="none" />
          <Text style={styles.arenaHint} pointerEvents="none">
            Grab & throw the ball
          </Text>

          <Animated.View style={[styles.ball, ballAnimatedStyle]}>
            <View style={styles.ballHighlight} />
          </Animated.View>
        </View>
      </GestureDetector>

      <TelemetryPanel telemetry={telemetry} onReset={reset} />
    </DemoScreen>
  );
}

const styles = StyleSheet.create({
  modeRow: {
    flexDirection: "row",
    gap: 8,
  },
  modeChip: {
    flex: 1,
    paddingVertical: 9,
    paddingHorizontal: 12,
    borderRadius: theme.radius.md,
    backgroundColor: theme.colors.chip,
    borderWidth: 1,
    borderColor: theme.colors.chipBorder,
    alignItems: "center",
  },
  modeChipSelected: {
    backgroundColor: theme.colors.chipSelected,
    borderColor: theme.colors.badgeBorder,
  },
  modeText: {
    fontSize: 12,
    fontWeight: "600",
    color: theme.colors.textSecondary,
    fontFamily: monoFont,
  },
  modeTextSelected: {
    color: theme.colors.accentStrong,
  },
  arena: {
    flex: 1,
    backgroundColor: theme.colors.card,
    borderWidth: 1.5,
    borderColor: theme.colors.cardBorder,
    borderRadius: theme.radius.xl,
    alignItems: "center",
    justifyContent: "center",
    overflow: "hidden",
  },
  centerCrosshairH: {
    position: "absolute",
    width: 18,
    height: 1,
    backgroundColor: theme.colors.cardBorder,
  },
  centerCrosshairV: {
    position: "absolute",
    width: 1,
    height: 18,
    backgroundColor: theme.colors.cardBorder,
  },
  arenaHint: {
    position: "absolute",
    top: 14,
    fontSize: 12,
    fontWeight: "600",
    color: theme.colors.textMuted,
  },
  ball: {
    width: BALL_SIZE,
    height: BALL_SIZE,
    borderRadius: BALL_SIZE / 2,
    backgroundColor: theme.colors.accent,
    borderWidth: 2,
    borderColor: theme.colors.accentStrong,
    shadowColor: "#000000",
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.18,
    shadowRadius: 10,
    elevation: 6,
  },
  ballHighlight: {
    position: "absolute",
    top: 10,
    left: 12,
    width: 16,
    height: 16,
    borderRadius: 8,
    backgroundColor: "rgba(255, 255, 255, 0.35)",
  },
});
