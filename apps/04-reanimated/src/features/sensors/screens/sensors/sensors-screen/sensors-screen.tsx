import { useEffect } from "react";
import { StyleSheet, View } from "react-native";
import Animated, {
  Easing,
  useAnimatedStyle,
  useSharedValue,
  withTiming,
} from "react-native-reanimated";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { useIsFocused } from "expo-router";
import { StatusBar } from "expo-status-bar";

import { GameOverlay } from "../components/game-overlay";
import { RoadTrack } from "../components/road-track";
import { VICE_COLORS } from "../constants";
import { useRacingGame } from "../hooks/use-racing-game";
import { SensorsLeftOverlay } from "./components/sensors-left-overlay";
import { SensorsRightOverlay } from "./components/sensors-right-overlay";
import { ViceBackdrop } from "./components/vice-backdrop";
import { useLandscapeOrientationLock } from "./hooks/use-landscape-orientation-lock";
import { useSensorsRoadLayout } from "./hooks/use-sensors-road-layout";

export function SensorsScreen() {
  const isFocused = useIsFocused();
  const insets = useSafeAreaInsets();

  const { isLandscape, roadWidth, roadHeight, leftPanelWidth, rightPanelWidth } =
    useSensorsRoadLayout(insets);

  const gameOpacity = useSharedValue(0);

  useLandscapeOrientationLock(isFocused);

  const showGame = isLandscape;

  useEffect(() => {
    if (showGame) {
      gameOpacity.set(0);
      gameOpacity.set(withTiming(1, { duration: 420, easing: Easing.out(Easing.ease) }));
    } else {
      gameOpacity.set(0);
    }
  }, [gameOpacity, showGame]);

  const gameFadeStyle = useAnimatedStyle(() => ({
    opacity: gameOpacity.get(),
  }));

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
  } = useRacingGame(isFocused && showGame);

  return (
    <View style={[styles.screen, !showGame && styles.gateScreen]}>
      <StatusBar style="light" hidden />

      {showGame && (
        <Animated.View style={[styles.gameStage, gameFadeStyle]}>
          <ViceBackdrop playerX={playerX} liveSpeedKmh={liveSpeedKmh} />

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

          <GameOverlay phase={phase} stats={stats} onStart={startGame} onResume={togglePause} />
        </Animated.View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  screen: {
    flex: 1,
    backgroundColor: VICE_COLORS.bgDeep,
  },
  gameStage: {
    flex: 1,
  },
  gateScreen: {
    backgroundColor: "#000000",
  },
  trackStage: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
  },
});
