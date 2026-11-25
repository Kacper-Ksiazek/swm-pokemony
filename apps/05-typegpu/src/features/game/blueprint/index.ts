import { BOARD_ROUTE_SPECS } from "./board-routes";
import { buildBoard } from "./build-board";

export type {
  BoardBlueprint,
  BoardPoint,
  BoardRegion,
  BoardRoute,
  BoardTile,
  RouteId,
  TileAction,
  TileId,
  TileKind,
} from "./board-blueprint.types";
export { TILE_SPACING } from "./build-board";

/** The one board this app plays on. Built once at import time; it is plain data. */
export const BOARD = buildBoard(BOARD_ROUTE_SPECS, "start");
