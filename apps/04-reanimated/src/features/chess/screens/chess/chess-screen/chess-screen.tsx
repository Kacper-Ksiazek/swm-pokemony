import { useState } from "react";
import { StatusBar } from "expo-status-bar";
import { StyleSheet, useWindowDimensions, View } from "react-native";
import Animated, { FadeIn, FadeOut } from "react-native-reanimated";
import { useSafeAreaInsets } from "react-native-safe-area-context";

import { GameHud } from "./components/game-hud";
import { GameLogo } from "./components/game-logo";
import { GameResultScreen, RESULT_GAME_FADE_OUT_MS } from "./components/game-result-screen";
import { ViceBoard } from "./components/vice-board";
import { VICE_CHESS_COLORS } from "../constants/vice-chess.constants";
import { ChessToolRow } from "./components/chess-tool-row";
import { useChessGame } from "./hooks/use-chess-game";

export function ChessScreen() {
  const insets = useSafeAreaInsets();
  const { width } = useWindowDimensions();
  const [boardSize, setBoardSize] = useState(() => Math.max(0, Math.floor(width - 24)));

  const {
    autopilot,
    board,
    checkedKingPos,
    elapsedSeconds,
    handleBack,
    handleReset,
    handleSquarePress,
    handleToggleAutopilot,
    isCheckmate,
    isGameOver,
    lastMove,
    legalMoves,
    outcome,
    selectedSquare,
    showResult,
    turn,
  } = useChessGame();

  return (
    <View style={styles.root}>
      <StatusBar style="light" />

      {showResult && outcome ? (
        <GameResultScreen
          key="result"
          outcome={outcome}
          elapsedSeconds={elapsedSeconds}
          onBack={handleBack}
          onNewGame={handleReset}
        />
      ) : (
        <Animated.View
          key="game"
          entering={FadeIn.duration(400)}
          exiting={FadeOut.duration(RESULT_GAME_FADE_OUT_MS)}
          style={[styles.screen, { paddingTop: Math.max(insets.top, 14) }]}
        >
          <View style={styles.logoSlot}>
            <GameLogo />
          </View>

          <GameHud turn={turn} isGameOver={isGameOver} elapsedSeconds={elapsedSeconds} />

          <View style={styles.boardContainer}>
            <View
              style={styles.boardShell}
              onLayout={(event) => {
                const next = Math.floor(event.nativeEvent.layout.width);
                setBoardSize((prev) => (prev === next ? prev : next));
              }}
            >
              {boardSize > 0 ? (
                <ViceBoard
                  board={board}
                  boardSize={boardSize}
                  autopilotActive={autopilot && !isGameOver}
                  checkmateWinner={isCheckmate && outcome && outcome !== "draw" ? outcome : null}
                  selectedSquare={selectedSquare}
                  legalMoves={legalMoves}
                  lastMove={lastMove}
                  checkedKingPos={checkedKingPos}
                  onSquarePress={handleSquarePress}
                />
              ) : null}
            </View>
          </View>

          <ChessToolRow
            autopilot={autopilot}
            paddingBottom={Math.max(insets.bottom, 8)}
            onBack={handleBack}
            onReset={handleReset}
            onToggleAutopilot={handleToggleAutopilot}
          />
        </Animated.View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  root: {
    flex: 1,
    backgroundColor: VICE_CHESS_COLORS.bgDeep,
  },
  screen: {
    ...StyleSheet.absoluteFill,
    backgroundColor: VICE_CHESS_COLORS.bgDeep,
    alignItems: "center",
    gap: 16,
    paddingBottom: 0,
    paddingHorizontal: 12,
  },
  logoSlot: {
    flex: 1,
    width: "100%",
    maxWidth: 440,
    minHeight: 0,
  },
  boardContainer: {
    width: "100%",
    maxWidth: 440,
    alignSelf: "stretch",
  },
  boardShell: {
    width: "100%",
    aspectRatio: 1,
  },
});
