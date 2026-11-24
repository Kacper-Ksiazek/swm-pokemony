import { useState } from "react";
import { StyleSheet, Text, View } from "react-native";
import { GestureDetector } from "react-native-gesture-handler";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { Canvas } from "react-native-webgpu";
import { StatusBar } from "expo-status-bar";

import { CpuBoard } from "./components/cpu-board";
import { StatsPanel } from "./components/stats-panel";
import { useBoardCamera } from "./hooks/use-board-camera";
import { useCpuLife } from "./hooks/use-cpu-life";
import { useLifeCanvas } from "./hooks/use-life-canvas";

type LifeEngine = "gpu" | "cpu";

export function BoardScreen() {
  const insets = useSafeAreaInsets();
  const [engine, setEngine] = useState<LifeEngine>("gpu");
  const { gesture, cameraRef, viewportRef } = useBoardCamera();
  const gpu = useLifeCanvas(cameraRef, viewportRef, engine === "gpu");
  const cpu = useCpuLife(cameraRef, viewportRef, engine === "cpu");
  const active = engine === "gpu" ? gpu : cpu;

  return (
    <View style={[styles.screen, { paddingLeft: insets.left }]}>
      <StatusBar hidden />

      <GestureDetector gesture={gesture}>
        <View style={styles.board}>
          {engine === "gpu" ? (
            <Canvas ref={gpu.canvasRef} style={StyleSheet.absoluteFill} />
          ) : (
            <CpuBoard cameraRef={cameraRef} viewportRef={viewportRef} field={cpu.field} />
          )}
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
          living={active.living}
          epoch={active.epoch}
          elapsedMs={active.elapsedMs}
          history={active.history}
          engine={engine}
          onEngineChange={setEngine}
          onReset={active.reset}
        />
        {engine === "gpu" && gpu.error ? <Text style={styles.error}>{gpu.error}</Text> : null}
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
