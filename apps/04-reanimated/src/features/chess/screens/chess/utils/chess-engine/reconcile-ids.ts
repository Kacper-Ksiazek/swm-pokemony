import type { BoardConfig } from "js-chess-engine";

import type { PieceIds, Position } from "./chess-engine.types";

/**
 * Carries piece ids across a move. The mover keeps its id; a piece that only changed square as
 * a side effect (the rook when castling) is matched by symbol; anything else that vanished is
 * a capture. Promotion needs no special case: the id stays, the symbol (so the sprite) changes.
 */
export function reconcileIds(
  prev: Position,
  next: BoardConfig,
  from: string,
  to: string,
): PieceIds {
  const ids: PieceIds = { [to]: prev.ids[from] };
  const unclaimed = Object.keys(prev.config.pieces).filter(
    (square) => square !== from && next.pieces[square] !== prev.config.pieces[square],
  );

  for (const [square, symbol] of Object.entries(next.pieces)) {
    if (square === to) {
      continue;
    }
    if (prev.config.pieces[square] === symbol) {
      ids[square] = prev.ids[square];
      continue;
    }
    const sourceIndex = unclaimed.findIndex((s) => prev.config.pieces[s] === symbol);
    if (sourceIndex !== -1) {
      ids[square] = prev.ids[unclaimed[sourceIndex]];
      unclaimed.splice(sourceIndex, 1);
    } else {
      ids[square] = `${symbol}-${square}-new`;
    }
  }

  return ids;
}
