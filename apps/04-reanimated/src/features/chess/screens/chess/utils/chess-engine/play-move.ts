import { Game } from "js-chess-engine";

import type { PlayedMove, Position, SquarePos } from "./chess-engine.types";
import { posToSquare } from "./square-coords";
import { reconcileIds } from "./reconcile-ids";
import { symbolToPiece } from "./symbol-to-piece";

export function playMove(
  game: Game,
  prev: Position,
  fromPos: SquarePos,
  toPos: SquarePos,
): PlayedMove {
  const from = posToSquare(fromPos);
  const to = posToSquare(toPos);

  game.move(from, to);
  // Not the object `move()` returns: its checkMate/isFinished flags lag a move behind
  // (check is set, mate is not), so the UI would never see the game end and the AI would
  // be asked to move in a finished game, which throws.
  const config = game.exportJson();
  const ids = reconcileIds(prev, config, from, to);

  const keptIds = new Set(Object.values(ids));
  const capturedSquare = Object.keys(prev.config.pieces).find(
    (square) => !keptIds.has(prev.ids[square]),
  );
  const captured = capturedSquare
    ? symbolToPiece(prev.config.pieces[capturedSquare], prev.ids[capturedSquare])
    : null;

  return { position: { config, ids }, captured };
}
