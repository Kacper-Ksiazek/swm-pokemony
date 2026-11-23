import { VICE_CHESS_COLORS } from "../../../constants/vice-chess.constants";

export const GAME_RESULT_COPY = {
  white: { eyebrow: "CHECKMATE", headline: "CYAN WINS", color: VICE_CHESS_COLORS.cyan },
  black: { eyebrow: "CHECKMATE", headline: "VICE WINS", color: VICE_CHESS_COLORS.pink },
  draw: { eyebrow: "STALEMATE", headline: "DRAW", color: VICE_CHESS_COLORS.gold },
} as const;
