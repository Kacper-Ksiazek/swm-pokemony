import { useCallback } from "react";
import { Pressable, StyleSheet, Text, useWindowDimensions, View } from "react-native";
import Animated, { useAnimatedStyle } from "react-native-reanimated";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { router, useFocusEffect, useIsFocused } from "expo-router";
import * as ScreenOrientation from "expo-screen-orientation";
import { StatusBar } from "expo-status-bar";

import { monoFont } from "@/components/demo-screen";
import { IconSymbol } from "@/components/icon-symbol";
import { theme } from "@/components/theme";

import { GameOverlay } from "./components/game-overlay";
import { RoadTrack } from "./components/road-track";
import { ScoreVisualizer } from "./components/score-visualizer";
import { SpeedVisualizer } from "./components/speed-visualizer";
import { useRacingGame } from "./hooks/use-racing-game";

export function SensorsScreen() {
  const isFocused = useIsFocused();
  const insets = useSafeAreaInsets();
  const { width: windowWidth, height: windowHeight } = useWindowDimensions();

  useFocusEffect(
    useCallback(() => {
      ScreenOrientation.lockAsync(ScreenOrientation.OrientationLock.LANDSCAPE).catch(() => {});

      return () => {
        ScreenOrientation.lockAsync(ScreenOrientation.OrientationLock.PORTRAIT_UP).catch(() => {});
      };
    }, []),
  );

  const {
    phase,
    stats,
    speedHud,
    playerX,
    playerLeanDeg,
    roadScrollY,
    traffic,
    hitFlash,
    invulnerableSec,
    liveSpeedKmh,
    brakePressed,
    gasPressed,
    startGame,
    togglePause,
    setBrakePressed,
    setGasPressed,
  } = useRacingGame(isFocused);

  const brakeAnimatedStyle = useAnimatedStyle(() => ({
    backgroundColor: brakePressed.get() ? theme.colors.accent : "rgba(185, 28, 28, 0.22)",
  }));

  const gasAnimatedStyle = useAnimatedStyle(() => ({
    backgroundColor: gasPressed.get() ? "#16A34A" : "rgba(21, 128, 61, 0.24)",
  }));

  const roadHeight = windowHeight;
  const roadWidth = Math.min(540, Math.max(280, windowWidth * 0.6));
  const leftEdgeSpace = (windowWidth - roadWidth) / 2 - Math.max(12, insets.left + 8) - 8;
  const rightEdgeSpace = (windowWidth - roadWidth) / 2 - Math.max(12, insets.right + 8) - 8;
  const leftPanelWidth = Math.max(135, leftEdgeSpace);
  const rightPanelWidth = Math.max(120, rightEdgeSpace);

  return (
    <View style={styles.screen}>
      <StatusBar style="light" hidden />

      <View style={styles.trackStage}>
        <RoadTrack
          width={roadWidth}
          height={roadHeight}
          playerX={playerX}
          playerLeanDeg={playerLeanDeg}
          roadScrollY={roadScrollY}
          traffic={traffic}
          hitFlash={hitFlash}
          invulnerableSec={invulnerableSec}
          liveSpeedKmh={liveSpeedKmh}
        />
        <GameOverlay phase={phase} stats={stats} onStart={startGame} onResume={togglePause} />
      </View>

      <View
        style={[
          styles.leftOverlay,
          {
            top: insets.top + 8,
            bottom: insets.bottom + 8,
            left: Math.max(12, insets.left + 8),
            width: leftPanelWidth,
          },
        ]}
        pointerEvents="box-none"
      >
        <View style={styles.leftTopGroup} pointerEvents="box-none">
          <View style={styles.topRow}>
            <Pressable
              accessibilityRole="button"
              accessibilityLabel="Wróć"
              onPress={() => router.back()}
              style={styles.backButton}
            >
              <IconSymbol name="chevron.left" size={18} color={theme.colors.textPrimary} />
              <Text style={styles.backButtonText}>Wróć</Text>
            </Pressable>

            {(phase === "playing" || phase === "paused") && (
              <Pressable accessibilityRole="button" onPress={togglePause} style={styles.pausePill}>
                <Text style={styles.pausePillText}>{phase === "playing" ? "Pauza" : "Wznów"}</Text>
              </Pressable>
            )}
          </View>

          {phase !== "gameover" && (
            <SpeedVisualizer
              speedKmh={speedHud.liveSpeedKmh}
              pedalState={speedHud.pedalState}
              liveSpeedKmh={liveSpeedKmh}
            />
          )}
        </View>

        {phase !== "gameover" && (
          <Animated.View
            onTouchStart={() => setBrakePressed(true)}
            onTouchEnd={() => setBrakePressed(false)}
            onTouchCancel={() => setBrakePressed(false)}
            style={[styles.pedalButton, styles.brakePedal, brakeAnimatedStyle]}
          >
            <Text style={styles.pedalLabel}>HAMULEC</Text>
            <Text style={styles.pedalSub}>ZWOLNIJ</Text>
          </Animated.View>
        )}
      </View>

      {phase !== "gameover" && (
        <View
          style={[
            styles.rightOverlay,
            {
              top: insets.top + 8,
              bottom: insets.bottom + 8,
              right: Math.max(12, insets.right + 8),
              width: rightPanelWidth,
            },
          ]}
          pointerEvents="box-none"
        >
          <ScoreVisualizer stats={stats} />

          <Animated.View
            onTouchStart={() => setGasPressed(true)}
            onTouchEnd={() => setGasPressed(false)}
            onTouchCancel={() => setGasPressed(false)}
            style={[styles.pedalButton, styles.gasPedal, gasAnimatedStyle]}
          >
            <Text style={styles.pedalLabel}>GAZ</Text>
            <Text style={styles.pedalSub}>PRZYSPIESZ</Text>
          </Animated.View>
        </View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  screen: {
    flex: 1,
    backgroundColor: "#111318",
  },
  trackStage: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
  },
  leftOverlay: {
    position: "absolute",
    justifyContent: "space-between",
    gap: 8,
  },
  leftTopGroup: {
    gap: 8,
  },
  topRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    gap: 6,
  },
  backButton: {
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
    paddingHorizontal: 10,
    paddingVertical: 7,
    borderRadius: 999,
    backgroundColor: theme.colors.card,
    borderWidth: 1,
    borderColor: theme.colors.cardBorder,
  },
  backButtonText: {
    fontSize: 12,
    fontWeight: "600",
    color: theme.colors.textPrimary,
  },
  pausePill: {
    paddingHorizontal: 12,
    paddingVertical: 7,
    borderRadius: 999,
    backgroundColor: theme.colors.pillBg,
    borderWidth: 1,
    borderColor: theme.colors.badgeBorder,
  },
  pausePillText: {
    fontSize: 12,
    fontWeight: "700",
    color: theme.colors.pillText,
  },
  rightOverlay: {
    position: "absolute",
    justifyContent: "space-between",
    gap: 8,
  },
  pedalButton: {
    paddingVertical: 14,
    paddingHorizontal: 12,
    borderRadius: theme.radius.md,
    borderWidth: 2,
    alignItems: "center",
    justifyContent: "center",
    gap: 2,
  },
  brakePedal: {
    borderColor: theme.colors.accent,
  },
  gasPedal: {
    borderColor: "#22C55E",
  },
  pedalLabel: {
    fontSize: 14,
    fontWeight: "900",
    letterSpacing: 0.8,
    color: "#FFFFFF",
    fontFamily: monoFont,
  },
  pedalSub: {
    fontSize: 9,
    fontWeight: "700",
    color: "rgba(255, 255, 255, 0.78)",
    fontFamily: monoFont,
  },
});
