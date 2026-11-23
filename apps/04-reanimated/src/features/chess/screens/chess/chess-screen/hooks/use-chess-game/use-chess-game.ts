import { useEffect, useRef, useState } from "react";
import * as Haptics from "expo-haptics";
import { router } from "expo-router";
import type { Game } from "js-chess-engine";

import type { PieceColor } from "@/features/chess/assets/chess-assets";

import { CYAN_AI_SKILL, VICE_AI_SKILL } from "../../../constants/vice-chess.constants";
import {
  createGame,
  createInitialPosition,
  findKingPosition,
  getAiMove,
  getLegalMoves,
  playMove,
  type GameOutcome,
  type Position,
  type SquarePos,
  toBoardState,
} from "../../../utils/chess-engine";
import { AI_THINK_DELAY_MS, RESULT_SWITCH_DELAY_MS } from "../../chess-screen.constants";
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

  // The Game instance is mutable; recomputing when selection or position (via `config`) changes.
  const legalMoves =
    selectedSquare && gameRef.current ? getLegalMoves(gameRef.current, selectedSquare) : [];

  const inCheck = config.check;
  const isCheckmate = config.checkMate;
  const isStalemate = config.staleMate;
  const isGameOver = config.isFinished;
  const checkedKingPos = inCheck ? findKingPosition(config, turn) : null;
  const outcome: GameOutcome | null = deriveGameOutcome(isCheckmate, isStalemate, turn);

  const aiToMove = turn === "black" || autopilot;

  // Black is always the AI; with autopilot on, white is too. The delay lets the previous move
  // finish animating first, and the cleanup cancels a pending move when the position changes
  // (e.g. reset) or autopilot is switched off.
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
    // `position` invalidates the scheduled move; `commitMove` is intentionally omitted (stable via React Compiler).
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [aiToMove, isGameOver, turn, position]);

  useEffect(() => {
    if (isGameOver) {
      return;
    }

    const interval = setInterval(() => {
      setElapsedSeconds((prev) => prev + 1);
    }, 1000);

    return () => clearInterval(interval);
  }, [isGameOver]);

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

  function handleReset() {
    void Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);

    const game = createGame();
    gameRef.current = game;
    setPosition(createInitialPosition(game));
    setSelectedSquare(null);
    setLastMove(null);
    setElapsedSeconds(0);
  }

  function commitMove(from: SquarePos, to: SquarePos) {
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
