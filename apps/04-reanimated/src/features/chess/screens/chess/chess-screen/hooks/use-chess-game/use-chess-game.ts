import { useCallback, useRef, useState } from "react";
import * as Haptics from "expo-haptics";
import { router } from "expo-router";
import type { Game } from "js-chess-engine";

import type { PieceColor } from "@/features/chess/assets/chess-assets";

import {
  createGame,
  createInitialPosition,
  findKingPosition,
  getLegalMoves,
  type GameOutcome,
  type Position,
  type SquarePos,
  toBoardState,
} from "../../../utils/chess-engine";

import { useAiAutoplay } from "./hooks/use-ai-autoplay";
import { useDelayedResultReveal } from "./hooks/use-delayed-result-reveal";
import { useElapsedGameTime } from "./hooks/use-elapsed-game-time";
import { commitPositionMove } from "./utils/commit-position-move";
import { deriveGameOutcome } from "./utils/derive-game-outcome";

export function useChessGame() {
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
  const turn = config.turn as PieceColor;
  const board = toBoardState(position);

  const legalMoves =
    selectedSquare && gameRef.current ? getLegalMoves(gameRef.current, selectedSquare) : [];

  const inCheck = config.check;
  const isCheckmate = config.checkMate;
  const isStalemate = config.staleMate;
  const isGameOver = config.isFinished;
  const checkedKingPos = inCheck ? findKingPosition(config, turn) : null;
  const outcome: GameOutcome | null = deriveGameOutcome(isCheckmate, isStalemate, turn);

  const aiToMove = turn === "black" || autopilot;

  function commitMove(from: SquarePos, to: SquarePos) {
    const game = gameRef.current;
    if (!game) {
      return;
    }

    setPosition((prev) => {
      const { position: nextPosition } = commitPositionMove({
        game,
        position: prev,
        from,
        to,
      });
      return nextPosition;
    });
    setLastMove({ from, to });
    setSelectedSquare(null);
  }

  useAiAutoplay({
    gameRef,
    aiToMove,
    isGameOver,
    turn,
    position,
    onAiMove: commitMove,
  });

  const tickElapsed = useCallback(() => {
    setElapsedSeconds((prev) => prev + 1);
  }, []);

  useElapsedGameTime(isGameOver, tickElapsed);

  useDelayedResultReveal(outcome, setShowResult);

  function handleReset() {
    void Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);

    const game = createGame();
    gameRef.current = game;
    setPosition(createInitialPosition(game));
    setSelectedSquare(null);
    setLastMove(null);
    setElapsedSeconds(0);
  }

  function handleToggleAutopilot() {
    void Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    setSelectedSquare(null);
    setAutopilot((prev) => !prev);
  }

  function handleSquarePress(pos: SquarePos) {
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
  }

  function handleBack() {
    router.back();
  }

  return {
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
  };
}
