import { Game } from "js-chess-engine";

import type { SquarePos } from "./chess-engine.types";
import { posToSquare, squareToPos } from "./square-coords";

export function getLegalMoves(game: Game, pos: SquarePos): SquarePos[] {
  const from = posToSquare(pos);
  return (game.moves(from)[from] ?? []).map(squareToPos);
}
