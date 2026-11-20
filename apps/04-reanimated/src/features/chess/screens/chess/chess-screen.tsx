import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import * as Haptics from "expo-haptics";
import { router } from "expo-router";
import { StatusBar } from "expo-status-bar";
import type { Game } from "js-chess-engine";
import { Pressable, StyleSheet, Text, useWindowDimensions, View } from "react-native";
import Animated, { FadeIn, FadeOut } from "react-native-reanimated";
import { useSafeAreaInsets } from "react-native-safe-area-context";

import { IconSymbol } from "@/components/icon-symbol";

import { AutopilotToolButton } from "./components/autopilot-tool-button";
import { GameHud } from "./components/game-hud";
import { GameLogo } from "./components/game-logo";
import { GameResultScreen, RESULT_GAME_FADE_OUT_MS } from "./components/game-result-screen";
import { ViceBoard } from "./components/vice-board";
import { CYAN_AI_SKILL, VICE_AI_SKILL, VICE_CHESS_COLORS } from "./constants/vice-chess.constants";
import {
  createGame,
  createInitialPosition,
  findKingPosition,
  type GameOutcome,
  getAiMove,
  getLegalMoves,
  playMove,
  type Position,
  type SquarePos,
  toBoardState,
} from "./utils/chess-engine";

const AI_THINK_DELAY_MS = 600;
/** Lets the final move (and the board's checkmate effect) play out before the result screen. */
const RESULT_SWITCH_DELAY_MS = 1200;

export function ChessScreen() {
  const insets = useSafeAreaInsets();
  const { width } = useWindowDimensions();
  const [boardSize, setBoardSize] = useState(() => Math.max(0, Math.floor(width - 24)));

  const gameRef = useRef<Game | null>(null);
  if (!gameRef.current) {
    gameRef.current = createGame();
  }

  const [position, setPosition] = useState<Position>(() =>
    createInitialPosition(gameRef.current as Game),
  );
  const [selectedSquare, setSelectedSquare] = useState<SquarePos | null>(null);
  const [lastMove, setLastMove] = useState<{ from: SquarePos; to: SquarePos } | null>(null);
  const [showResult, setShowResult] = useState(false);
  const [autopilot, setAutopilot] = useState(false);
  const [elapsedSeconds, setElapsedSeconds] = useState(0);

  const { config } = position;
  const turn = config.turn;
  const board = useMemo(() => toBoardState(position), [position]);

  const legalMoves = useMemo(() => {
    if (!selectedSquare || !gameRef.current) {
      return [];
    }
    return getLegalMoves(gameRef.current, selectedSquare);
    // The Game instance is mutable, so `config` (new on every move) is what invalidates this.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [config, selectedSquare]);

  const inCheck = config.check;
  const isCheckmate = config.checkMate;
  const isStalemate = config.staleMate;
  const isGameOver = config.isFinished;

  const checkedKingPos = useMemo(
    () => (inCheck ? findKingPosition(config, turn) : null),
    [config, inCheck, turn],
  );

  const handleReset = useCallback(() => {
    void Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    const game = createGame();
    gameRef.current = game;
    setPosition(createInitialPosition(game));
    setSelectedSquare(null);
    setLastMove(null);
    setElapsedSeconds(0);
  }, []);

  const commitMove = useCallback(
    (from: SquarePos, to: SquarePos) => {
      const game = gameRef.current;
      if (!game) {
        return;
      }

      const { position: nextPosition, captured } = playMove(game, position, from, to);
      setPosition(nextPosition);
      setLastMove({ from, to });
      setSelectedSquare(null);

      void Haptics.impactAsync(
        captured ? Haptics.ImpactFeedbackStyle.Heavy : Haptics.ImpactFeedbackStyle.Light,
      );
    },
    [position],
  );

  // Black is always the AI; with autopilot on, white is too. The delay lets the previous move
  // finish animating first, and the cleanup cancels a pending move when the position changes
  // (e.g. reset) or autopilot is switched off.
  const aiToMove = turn === "black" || autopilot;
  useEffect(() => {
    if (!aiToMove || isGameOver) {
      return;
    }
    const timeout = setTimeout(() => {
      const game = gameRef.current;
      const aiSkill = turn === "white" ? CYAN_AI_SKILL : VICE_AI_SKILL;
      const aiMove = game ? getAiMove(game, aiSkill) : null;
      if (aiMove) {
        commitMove(aiMove.from, aiMove.to);
      }
    }, AI_THINK_DELAY_MS);
    return () => clearTimeout(timeout);
  }, [aiToMove, commitMove, isGameOver, turn]);

  useEffect(() => {
    if (isGameOver) {
      return;
    }
    const interval = setInterval(() => {
      setElapsedSeconds((prev) => prev + 1);
    }, 1000);
    return () => clearInterval(interval);
  }, [isGameOver]);

  const handleToggleAutopilot = useCallback(() => {
    void Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    setSelectedSquare(null);
    setAutopilot((prev) => !prev);
  }, []);

  const handleSquarePress = useCallback(
    (pos: SquarePos) => {
      if (isGameOver || aiToMove) {
        return;
      }

      const tappedPiece = board[pos.row][pos.col];

      if (selectedSquare) {
        const isLegalTarget = legalMoves.some((m) => m.row === pos.row && m.col === pos.col);

        if (isLegalTarget) {
          commitMove(selectedSquare, pos);
          return;
        }

        if (selectedSquare.row === pos.row && selectedSquare.col === pos.col) {
          setSelectedSquare(null);
          return;
        }
      }

      if (tappedPiece && tappedPiece.color === turn) {
        void Haptics.selectionAsync();
        setSelectedSquare(pos);
      } else {
        setSelectedSquare(null);
      }
    },
    [aiToMove, board, commitMove, isGameOver, legalMoves, selectedSquare, turn],
  );

  // The side to move is the one that got mated, so the other side won.
  const outcome: GameOutcome | null = isCheckmate
    ? turn === "white"
      ? "black"
      : "white"
    : isStalemate
      ? "draw"
      : null;

  // Hold the board for a moment after mate/stalemate, then swap the whole game view for the
  // result screen. Starting a new game clears `outcome`, which swaps straight back.
  useEffect(() => {
    if (!outcome) {
      setShowResult(false);
      return;
    }
    const timeout = setTimeout(() => setShowResult(true), RESULT_SWITCH_DELAY_MS);
    return () => clearTimeout(timeout);
  }, [outcome]);

  const handleBack = useCallback(() => router.back(), []);

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

          <View style={[styles.toolRow, { paddingBottom: Math.max(insets.bottom, 8) }]}>
            <Pressable
              accessibilityRole="button"
              accessibilityLabel="Wróć"
              hitSlop={8}
              onPress={handleBack}
              style={({ pressed }) => [
                styles.toolButton,
                styles.toolButtonMuted,
                pressed && styles.toolButtonPressed,
              ]}
            >
              <IconSymbol name="chevron.left" size={18} color={VICE_CHESS_COLORS.textPrimary} />
              <Text style={styles.toolLabel} numberOfLines={1}>
                Back
              </Text>
            </Pressable>

            <AutopilotToolButton autopilot={autopilot} onPress={handleToggleAutopilot} />

            <Pressable
              accessibilityRole="button"
              accessibilityLabel="Reset game"
              onPress={handleReset}
              style={({ pressed }) => [
                styles.toolButton,
                styles.toolButtonGold,
                pressed && styles.toolButtonPressed,
              ]}
            >
              <IconSymbol name="arrow.counterclockwise" size={18} color={VICE_CHESS_COLORS.gold} />
              <Text style={[styles.toolLabel, styles.toolLabelGold]} numberOfLines={1}>
                Reset
              </Text>
            </Pressable>
          </View>
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
  toolRow: {
    width: "100%",
    maxWidth: 440,
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
  },
  toolButton: {
    flex: 1,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 8,
    minHeight: 50,
    paddingHorizontal: 14,
    paddingVertical: 12,
    borderRadius: 12,
    borderWidth: 1,
  },
  toolButtonGold: {
    borderColor: VICE_CHESS_COLORS.gold,
    backgroundColor: "rgba(255, 214, 0, 0.08)",
  },
  toolButtonMuted: {
    borderColor: "rgba(196, 181, 253, 0.45)",
    backgroundColor: "rgba(255, 255, 255, 0.06)",
  },
  toolButtonPressed: {
    opacity: 0.85,
  },
  toolLabel: {
    color: VICE_CHESS_COLORS.textPrimary,
    fontSize: 14,
    fontWeight: "800",
    letterSpacing: 0.4,
  },
  toolLabelGold: {
    color: VICE_CHESS_COLORS.gold,
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
