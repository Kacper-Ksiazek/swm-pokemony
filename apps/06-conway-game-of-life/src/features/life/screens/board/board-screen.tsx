import { StyleSheet, Text, View } from "react-native";
import { GestureDetector } from "react-native-gesture-handler";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { Canvas } from "react-native-webgpu";
import { StatusBar } from "expo-status-bar";

import { StatsPanel } from "./components/stats-panel";
import { useBoardCamera } from "./hooks/use-board-camera";
import { useLifeCanvas } from "./hooks/use-life-canvas";

export function BoardScreen() {
  const insets = useSafeAreaInsets();
  const { gesture, cameraRef, viewportRef } = useBoardCamera();
  const { canvasRef, error, living, epoch, elapsedMs, history, reset } = useLifeCanvas(
    cameraRef,
    viewportRef,
  );

  return (
    <View style={[styles.screen, { paddingLeft: insets.left }]}>
      <StatusBar hidden />

      <GestureDetector gesture={gesture}>
        <View style={styles.board}>
          <Canvas ref={canvasRef} style={StyleSheet.absoluteFill} />
        </View>
      </GestureDetector>

      <View
        style={[
          styles.side,
          {
            paddingTop: insets.top,
            paddingBottom: insets.bottom,
            paddingRight: insets.right,
          },
        ]}
      >
        <StatsPanel
          living={living}
          epoch={epoch}
          elapsedMs={elapsedMs}
          history={history}
          onReset={reset}
        />
        {error ? <Text style={styles.error}>{error}</Text> : null}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  screen: {
    flex: 1,
    flexDirection: "row",
    backgroundColor: "#101114",
  },
  board: {
    flex: 1,
  },
  side: {
    backgroundColor: "#18181b",
  },
  error: {
    paddingHorizontal: 16,
    paddingBottom: 12,
    fontSize: 13,
    lineHeight: 18,
    color: "#FFB4B4",
  },
});
