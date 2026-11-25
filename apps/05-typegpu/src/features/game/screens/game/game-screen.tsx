import { useEffect, useState } from "react";
import { Pressable, StyleSheet, Text, View } from "react-native";
import { GestureDetector } from "react-native-gesture-handler";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { Canvas } from "react-native-webgpu";
import { StatusBar } from "expo-status-bar";

import { BOARD } from "../../blueprint";
import { useGameStore } from "../../store/game-store";
import { GAME_COLORS } from "../../theme";
import { PlayerPanel } from "./components/player-panel";
import { TurnModal } from "./components/turn-modal";
import { useBoardGestures } from "./hooks/use-board-gestures";
import { useBoardRenderer } from "./hooks/use-board-renderer";
import { useTurnRunner } from "./hooks/use-turn-runner";

type ViewMode = "player" | "board";

/** The 3D board on top, the current player's panel below, and the turn modal over both. */
export function GameScreen() {
  const insets = useSafeAreaInsets();
  const { canvasRef, scene } = useBoardRenderer(BOARD);
  const gesture = useBoardGestures(scene);
  const phase = useGameStore((state) => state.phase);
  const players = useGameStore((state) => state.players);
  const currentIndex = useGameStore((state) => state.currentIndex);
  const startGame = useGameStore((state) => state.startGame);
  const [viewMode, setViewMode] = useState<ViewMode>("player");
  const currentId = players[currentIndex]?.id ?? null;

  useTurnRunner();

  // Opening /game directly (or a dev reload) skips setup: start with the default players.
  useEffect(() => {
    if (phase === "setup") {
      startGame();
    }
  }, [phase, startGame]);

  useEffect(() => {
    scene?.setPawns(
      players.map(({ id, vehicleId, color, tileId }) => ({ id, vehicleId, color, tileId })),
      currentId,
    );
  }, [scene, players, currentId]);

  // Every new turn zooms in on whoever plays now.
  useEffect(() => {
    setViewMode("player");
  }, [currentId]);

  useEffect(() => {
    scene?.focusPawn(viewMode === "player" ? currentId : null);
  }, [scene, viewMode, currentId]);

  return (
    <View style={styles.screen}>
      <StatusBar style="dark" />

      <GestureDetector gesture={gesture}>
        <View style={styles.board}>
          <Canvas ref={canvasRef} style={StyleSheet.absoluteFill} />
        </View>
      </GestureDetector>

      <View style={[styles.topBar, { top: insets.top + 8 }]} pointerEvents="box-none">
        <Text style={styles.title}>Ścieżka życia</Text>
        <Pressable
          accessibilityRole="button"
          onPress={() => setViewMode(viewMode === "player" ? "board" : "player")}
          style={styles.viewToggle}
        >
          <Text style={styles.viewToggleText}>
            {viewMode === "player" ? "Cała plansza" : "Pokaż gracza"}
          </Text>
        </Pressable>
      </View>

      <PlayerPanel bottomInset={insets.bottom} />
      <TurnModal />
    </View>
  );
}

const styles = StyleSheet.create({
  screen: {
    flex: 1,
    backgroundColor: "#BFE4FF",
  },
  board: {
    flex: 1,
  },
  topBar: {
    position: "absolute",
    left: 16,
    right: 16,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },
  title: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 12,
    overflow: "hidden",
    backgroundColor: "rgba(255, 255, 255, 0.85)",
    fontSize: 16,
    fontWeight: "900",
    color: GAME_COLORS.textPrimary,
  },
  viewToggle: {
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 12,
    backgroundColor: "rgba(255, 255, 255, 0.85)",
  },
  viewToggleText: {
    fontSize: 14,
    fontWeight: "800",
    color: GAME_COLORS.accent,
  },
});
