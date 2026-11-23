import * as Haptics from "expo-haptics";
import type { Game } from "js-chess-engine";

import { playMove, type Position, type SquarePos } from "../../../../utils/chess-engine";

export type CommitPositionMoveArgs = {
  game: Game;
  position: Position;
  from: SquarePos;
  to: SquarePos;
};

export type CommitPositionMoveResult = {
  position: Position;
  lastMove: { from: SquarePos; to: SquarePos };
};

export function commitPositionMove({
  game,
  position,
  from,
  to,
}: CommitPositionMoveArgs): CommitPositionMoveResult {
  const { position: nextPosition, captured } = playMove(game, position, from, to);

  void Haptics.impactAsync(
    captured ? Haptics.ImpactFeedbackStyle.Heavy : Haptics.ImpactFeedbackStyle.Light,
  );

  return { position: nextPosition, lastMove: { from, to } };
}
