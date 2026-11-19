import { StyleSheet, View } from "react-native";
import type { SharedValue } from "react-native-reanimated";
import type { EdgeInsets } from "react-native-safe-area-context";

import { ScoreVisualizer } from "../../components/score-visualizer";
import type { GamePhase, RaceStats } from "../../sensors.types";
import { PedalButton } from "./pedal-button";

type SensorsRightOverlayProps = {
  insets: EdgeInsets;
  panelWidth: number;
  phase: GamePhase;
  stats: RaceStats;
  gasPressed: SharedValue<boolean>;
  onGasPressIn: () => void;
  onGasPressOut: () => void;
};

export function SensorsRightOverlay({
  insets,
  panelWidth,
  phase,
  stats,
  gasPressed,
  onGasPressIn,
  onGasPressOut,
}: SensorsRightOverlayProps) {
  if (phase === "gameover") {
    return null;
  }

  return (
    <View
      style={[
        styles.rightOverlay,
        {
          top: insets.top + 8,
          bottom: insets.bottom + 8,
          right: Math.max(12, insets.right + 8),
          width: panelWidth,
        },
      ]}
      pointerEvents="box-none"
    >
      <ScoreVisualizer stats={stats} />

      <PedalButton
        variant="gas"
        pressed={gasPressed}
        label="GAZ"
        sublabel="PRZYSPIESZ"
        onPressIn={onGasPressIn}
        onPressOut={onGasPressOut}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  rightOverlay: {
    position: "absolute",
    justifyContent: "space-between",
    gap: 8,
  },
});
