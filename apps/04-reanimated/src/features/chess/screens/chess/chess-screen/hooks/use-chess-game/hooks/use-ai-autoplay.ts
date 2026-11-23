import { useEffect, type RefObject } from "react";
import type { Game } from "js-chess-engine";

import type { PieceColor } from "@/features/chess/assets/chess-assets";

import { CYAN_AI_SKILL, VICE_AI_SKILL } from "../../../../constants/vice-chess.constants";
import { getAiMove, type Position, type SquarePos } from "../../../../utils/chess-engine";
import { AI_THINK_DELAY_MS } from "../../../chess-screen.constants";

type UseAiAutoplayParams = {
  gameRef: RefObject<Game | null>;
  aiToMove: boolean;
  isGameOver: boolean;
  turn: PieceColor;
  position: Position;
  onAiMove: (from: SquarePos, to: SquarePos) => void;
};

/** Black is always AI; with autopilot, white is too. Delay lets the prior move animate first. */
export function useAiAutoplay({
  gameRef,
  aiToMove,
  isGameOver,
  turn,
  position,
  onAiMove,
}: UseAiAutoplayParams) {
  useEffect(() => {
    if (!aiToMove || isGameOver) {
      return;
    }

    const timeout = setTimeout(() => {
      const game = gameRef.current;
      const aiSkill = turn === "white" ? CYAN_AI_SKILL : VICE_AI_SKILL;
      const aiMove = game ? getAiMove(game, aiSkill) : null;

      if (aiMove) {
        onAiMove(aiMove.from, aiMove.to);
      }
    }, AI_THINK_DELAY_MS);

    return () => clearTimeout(timeout);
    // `position` invalidates the scheduled move; `onAiMove` is intentionally omitted (stable via React Compiler).
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [aiToMove, isGameOver, turn, position]);
}
