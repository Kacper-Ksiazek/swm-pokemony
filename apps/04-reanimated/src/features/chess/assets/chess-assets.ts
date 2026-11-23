import type { ImageSource } from "expo-image";

export type PieceColor = "white" | "black";
export type PieceType = "king" | "queen" | "rook" | "bishop" | "knight" | "pawn";

export const CHESS_BOARD_IMAGE: ImageSource = require("./vice-chessboard-slate.jpg");
export const CHESS_LOGO_IMAGE: ImageSource = require("./vice-chess-logo.png");

export const CHESS_PIECE_IMAGES: Record<PieceColor, Record<PieceType, ImageSource>> = {
  white: {
    king: require("./white-king.png"),
    queen: require("./white-queen.png"),
    rook: require("./white-rook.png"),
    bishop: require("./white-bishop.png"),
    knight: require("./white-knight.png"),
    pawn: require("./white-pawn.png"),
  },
  black: {
    king: require("./black-king.png"),
    queen: require("./black-queen.png"),
    rook: require("./black-rook.png"),
    bishop: require("./black-bishop.png"),
    knight: require("./black-knight.png"),
    pawn: require("./black-pawn.png"),
  },
};
