/**
 * Board blueprint types.
 *
 * Coordinates are board units on the table plane: `x` grows to the right, `z` grows toward the
 * player (down on screen). One unit is roughly one tile. The 3D scene maps them 1:1 to world X/Z.
 */

/** What landing on (or passing) a tile does. The game rules read this, the scene only colors it. */
export type TileKind =
  "start" | "event" | "action" | "payday" | "stop" | "career" | "house" | "baby" | "pet" | "retire";

/** Scenery the tile sits in. Used for flavor text now, terrain and props later. */
export type BoardRegion =
  "coast" | "campus" | "downtown" | "suburbs" | "meadow" | "alpine" | "harbor";

export type RouteId = "start" | "college" | "career" | "main" | "family" | "adventure" | "golden";

export type TileId = `${RouteId}-${number}`;

export type BoardPoint = {
  x: number;
  z: number;
};

/**
 * A one-off rule on a named tile, run instead of the tile kind's usual rule.
 * - `enroll`: pay tuition,
 * - `graduate`: earn the degree (unlocks better careers),
 * - `wedding`: every other player gives a gift,
 * - `midlife`: draw a midlife event,
 * - `bonus`: collect double salary.
 */
export type TileAction = "enroll" | "graduate" | "wedding" | "midlife" | "bonus";

/** A tile placed at `order` along its route. `"last"` targets the final tile. */
export type TileSpecial = {
  at: number | "last";
  kind: TileKind;
  label: string;
  action?: TileAction;
};

/** Hand-written description of one stretch of road. `buildBoard` turns it into tiles. */
export type BoardRouteSpec = {
  id: RouteId;
  title: string;
  region: BoardRegion;
  /** Control points the road passes through. A smooth curve joins them; tiles are spread
   * evenly along it, ends included. */
  path: BoardPoint[];
  /** Kinds cycled for every tile that is not a special. */
  pattern: TileKind[];
  specials: TileSpecial[];
  /** Routes the last tile leads to. Two or more means the player picks a branch. */
  continuesTo: RouteId[];
};

export type BoardTile = {
  id: TileId;
  routeId: RouteId;
  /** Position along the route, from 0. */
  order: number;
  kind: TileKind;
  region: BoardRegion;
  label: string | null;
  action: TileAction | null;
  position: BoardPoint;
  /** Travel direction in radians around the Y axis (0 = toward +x). */
  heading: number;
  /** Tiles a pawn can move to from here. Empty only on the finish tile. */
  next: TileId[];
};

export type BoardRoute = {
  id: RouteId;
  title: string;
  region: BoardRegion;
  tileIds: TileId[];
  continuesTo: RouteId[];
};

export type BoardBlueprint = {
  /** Table size in board units, centered on the origin. */
  size: { width: number; depth: number };
  startTileId: TileId;
  finishTileId: TileId;
  routes: Record<RouteId, BoardRoute>;
  tiles: BoardTile[];
  tilesById: Record<TileId, BoardTile>;
};
