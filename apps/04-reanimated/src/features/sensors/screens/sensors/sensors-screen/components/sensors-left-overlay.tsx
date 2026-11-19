import { Pressable, StyleSheet, Text, View } from "react-native";
import type { SharedValue } from "react-native-reanimated";
import type { EdgeInsets } from "react-native-safe-area-context";
import { router } from "expo-router";

import { IconSymbol } from "@/components/icon-symbol";
import { theme } from "@/components/theme";

import { SpeedVisualizer } from "../../components/speed-visualizer";
import type { GamePhase, PedalState } from "../../sensors.types";
import { PedalButton } from "./pedal-button";

type SensorsLeftOverlayProps = {
  insets: EdgeInsets;
  panelWidth: number;
  phase: GamePhase;
  speedKmh: number;
  pedalState: PedalState;
  liveSpeedKmh: SharedValue<number>;
  brakePressed: SharedValue<boolean>;
  onTogglePause: () => void;
  onBrakePressIn: () => void;
  onBrakePressOut: () => void;
};

export function SensorsLeftOverlay({
  insets,
  panelWidth,
  phase,
  speedKmh,
  pedalState,
  liveSpeedKmh,
  brakePressed,
  onTogglePause,
  onBrakePressIn,
  onBrakePressOut,
}: SensorsLeftOverlayProps) {
  return (
    <View
      style={[
        styles.leftOverlay,
        {
          top: insets.top + 8,
          bottom: insets.bottom + 8,
          left: Math.max(12, insets.left + 8),
          width: panelWidth,
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
            <Pressable accessibilityRole="button" onPress={onTogglePause} style={styles.pausePill}>
              <Text style={styles.pausePillText}>{phase === "playing" ? "Pauza" : "Wznów"}</Text>
            </Pressable>
          )}
        </View>

        {phase !== "gameover" && (
          <SpeedVisualizer
            speedKmh={speedKmh}
            pedalState={pedalState}
            liveSpeedKmh={liveSpeedKmh}
          />
        )}
      </View>

      {phase !== "gameover" && (
        <PedalButton
          variant="brake"
          pressed={brakePressed}
          label="HAMULEC"
          sublabel="ZWOLNIJ"
          onPressIn={onBrakePressIn}
          onPressOut={onBrakePressOut}
        />
      )}
    </View>
  );
}

const styles = StyleSheet.create({
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
});
