import type {
  BoardBlueprint,
  BoardPoint,
  BoardRoute,
  BoardRouteSpec,
  BoardTile,
  RouteId,
  TileId,
} from "./board-blueprint.types";
import { addJunctionLanes, type JunctionAnchor, type RouteGeometry } from "./junction-lanes";

/** Distance between neighbouring tile centers, in board units. */
export const TILE_SPACING = 1;

/** Empty table around the outermost tiles, in board units. */
const BOARD_MARGIN = 1.6;

function distance(a: BoardPoint, b: BoardPoint) {
  return Math.hypot(b.x - a.x, b.z - a.z);
}

/** Polyline points generated between two control points of a smoothed route. */
const SMOOTH_STEPS = 16;

/**
 * Catmull-Rom spline through the control points: the road passes through every point and bends
 * smoothly between them. The ends are repeated so the curve starts and stops on them.
 */
function smoothPath(points: BoardPoint[]): BoardPoint[] {
  if (points.length < 3) {
    return points;
  }

  const padded = [points[0], ...points, points[points.length - 1]];
  const smoothed: BoardPoint[] = [];

  for (let index = 1; index < padded.length - 2; index += 1) {
    const [p0, p1, p2, p3] = padded.slice(index - 1, index + 3);

    for (let step = 0; step < SMOOTH_STEPS; step += 1) {
      const t = step / SMOOTH_STEPS;
      const t2 = t * t;
      const t3 = t2 * t;
      const blend = (a: number, b: number, c: number, e: number) =>
        0.5 *
        (2 * b + (c - a) * t + (2 * a - 5 * b + 4 * c - e) * t2 + (3 * b - a - 3 * c + e) * t3);

      smoothed.push({ x: blend(p0.x, p1.x, p2.x, p3.x), z: blend(p0.z, p1.z, p2.z, p3.z) });
    }
  }

  smoothed.push(points[points.length - 1]);

  return smoothed;
}

/** Evenly spaced points along a polyline, both ends included, with the travel heading at each. */
function samplePath(path: BoardPoint[], spacing: number) {
  if (path.length === 1) {
    return [{ position: path[0], heading: 0 }];
  }

  const segmentLengths = path.slice(1).map((point, index) => distance(path[index], point));
  const totalLength = segmentLengths.reduce((sum, length) => sum + length, 0);
  const count = Math.max(2, Math.round(totalLength / spacing) + 1);

  return Array.from({ length: count }, (_, order) => {
    let remaining = (totalLength * order) / (count - 1);
    let segment = 0;

    while (segment < segmentLengths.length - 1 && remaining > segmentLengths[segment]) {
      remaining -= segmentLengths[segment];
      segment += 1;
    }

    const from = path[segment];
    const to = path[segment + 1];
    const t = segmentLengths[segment] === 0 ? 0 : remaining / segmentLengths[segment];

    return {
      position: { x: from.x + (to.x - from.x) * t, z: from.z + (to.z - from.z) * t },
      heading: Math.atan2(to.z - from.z, to.x - from.x),
    };
  });
}

function tileId(routeId: RouteId, order: number): TileId {
  return `${routeId}-${order}`;
}

function buildRouteTiles(spec: BoardRouteSpec, geometry: RouteGeometry): BoardTile[] {
  const samples = samplePath(smoothPath(geometry.path), TILE_SPACING);
  const lastOrder = samples.length - 1;

  return samples.map(({ position, heading }, order) => {
    const special = spec.specials.find(
      ({ at }) => at === order || (at === "last" && order === lastOrder),
    );

    return {
      id: tileId(spec.id, order),
      routeId: spec.id,
      order,
      kind: special?.kind ?? spec.pattern[order % spec.pattern.length],
      region: spec.region,
      label: special?.label ?? null,
      action: special?.action ?? null,
      position,
      heading: geometry.heading ?? heading,
      next: order < lastOrder ? [tileId(spec.id, order + 1)] : [],
    };
  });
}

/** Turns the hand-written route specs into a linked tile graph the game and the scene can read. */
export function buildBoard(specs: BoardRouteSpec[], startRouteId: RouteId): BoardBlueprint {
  // First pass: tiles from the routes as written, only to find where junctions sit.
  const draftTiles = new Map(
    specs.map((spec) => [spec.id, buildRouteTiles(spec, { path: spec.path, heading: null })]),
  );
  const anchorOf = (tile: BoardTile): JunctionAnchor => ({
    position: tile.position,
    heading: tile.heading,
  });
  const anchors = {
    first: new Map(specs.map((spec) => [spec.id, anchorOf(draftTiles.get(spec.id)![0])])),
    last: new Map(specs.map((spec) => [spec.id, anchorOf(draftTiles.get(spec.id)!.at(-1)!)])),
  };

  // Second pass: the same routes with lanes added at forks and merges.
  const geometry = addJunctionLanes(specs, anchors);
  const routeTiles = new Map(
    specs.map((spec) => [spec.id, buildRouteTiles(spec, geometry.get(spec.id)!)]),
  );

  for (const spec of specs) {
    const tiles = routeTiles.get(spec.id) ?? [];
    const lastTile = tiles[tiles.length - 1];

    lastTile.next = spec.continuesTo.map((routeId) => tileId(routeId, 0));
  }

  const tiles = specs.flatMap((spec) => routeTiles.get(spec.id) ?? []);
  const tilesById = Object.fromEntries(tiles.map((tile) => [tile.id, tile])) as Record<
    TileId,
    BoardTile
  >;

  const routes = Object.fromEntries(
    specs.map((spec): [RouteId, BoardRoute] => [
      spec.id,
      {
        id: spec.id,
        title: spec.title,
        region: spec.region,
        tileIds: (routeTiles.get(spec.id) ?? []).map((tile) => tile.id),
        continuesTo: spec.continuesTo,
      },
    ]),
  ) as Record<RouteId, BoardRoute>;

  const finishTile = tiles.find((tile) => tile.next.length === 0);

  if (!finishTile) {
    throw new Error("Board blueprint has no finish tile: every route continues somewhere.");
  }

  // Square table: the camera looks at it corner-on, so it reads as a diamond on screen.
  const reach = Math.max(
    ...tiles.map((tile) => Math.max(Math.abs(tile.position.x), Math.abs(tile.position.z))),
  );
  const side = 2 * (reach + BOARD_MARGIN);

  return {
    size: { width: side, depth: side },
    startTileId: tileId(startRouteId, 0),
    finishTileId: finishTile.id,
    routes,
    tiles,
    tilesById,
  };
}
