import { Game } from "js-chess-engine";
import type { AILevel } from "js-chess-engine";

import type { SquarePos } from "./chess-engine.types";
import { squareToPos } from "./square-coords";

/**
 * Asks the engine for the best move without applying it, so the caller plays it through
 * `playMove` and the id tracking / animation stay identical to a human move.
 * `ai()` is synchronous and blocks the JS thread; keep the level low.
 */
export function getAiMove(game: Game, level: AILevel): { from: SquarePos; to: SquarePos } | null {
  if (game.exportJson().isFinished) {
    return null; // ai() throws on a finished game
  }
  // Small randomness: with two AIs playing each other (autopilot) a fully deterministic
  // engine can repeat the same moves forever.
  const { move } = game.ai({ level, play: false, randomness: 30 });
  const [from, to] = Object.entries(move)[0] ?? [];
  return from && to ? { from: squareToPos(from), to: squareToPos(to) } : null;
}
