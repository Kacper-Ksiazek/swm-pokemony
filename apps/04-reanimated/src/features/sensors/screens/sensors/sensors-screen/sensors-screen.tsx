import { StyleSheet, View } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { useIsFocused } from "expo-router";
import { StatusBar } from "expo-status-bar";

import { GameOverlay } from "../components/game-overlay";
import { RoadTrack } from "../components/road-track";
import { useRacingGame } from "../hooks/use-racing-game";
import { SensorsLeftOverlay } from "./components/sensors-left-overlay";
import { SensorsRightOverlay } from "./components/sensors-right-overlay";
import { useLandscapeOrientationLock } from "./hooks/use-landscape-orientation-lock";
import { useSensorsRoadLayout } from "./hooks/use-sensors-road-layout";

export function SensorsScreen() {
  const isFocused = useIsFocused();
  const insets = useSafeAreaInsets();

  useLandscapeOrientationLock();

  const { roadWidth, roadHeight, leftPanelWidth, rightPanelWidth } = useSensorsRoadLayout(insets);

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

      <SensorsLeftOverlay
        insets={insets}
        panelWidth={leftPanelWidth}
        phase={phase}
        speedKmh={speedHud.liveSpeedKmh}
        pedalState={speedHud.pedalState}
        liveSpeedKmh={liveSpeedKmh}
        brakePressed={brakePressed}
        onTogglePause={togglePause}
        onBrakePressIn={() => setBrakePressed(true)}
        onBrakePressOut={() => setBrakePressed(false)}
      />

      <SensorsRightOverlay
        insets={insets}
        panelWidth={rightPanelWidth}
        phase={phase}
        stats={stats}
        gasPressed={gasPressed}
        onGasPressIn={() => setGasPressed(true)}
        onGasPressOut={() => setGasPressed(false)}
      />
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
});
