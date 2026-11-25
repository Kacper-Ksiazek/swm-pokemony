import type { BoardPoint, BoardRouteSpec, RouteId } from "./board-blueprint.types";

/** Sideways distance from the junction center line to each lane. Board units. */
const LANE_OFFSET = 0.55;
/** Distance from the junction tile to the first lane tile, along the junction heading. */
const LANE_LEAD = 1;
/** How far the lanes run straight and side by side before the route's own points take over. */
const LANE_RUN = 1;

/** Where a junction tile sits and which way the road through it points. */
export type JunctionAnchor = {
  position: BoardPoint;
  heading: number;
};

export type RouteGeometry = {
  path: BoardPoint[];
  /** Set only for one-tile routes (the start), which have no direction of their own. */
  heading: number | null;
};

function offsetPoint(anchor: JunctionAnchor, along: number, across: number): BoardPoint {
  const direction = { x: Math.cos(anchor.heading), z: Math.sin(anchor.heading) };
  const normal = { x: -direction.z, z: direction.x };

  return {
    x: anchor.position.x + direction.x * along + normal.x * across,
    z: anchor.position.z + direction.z * along + normal.z * across,
  };
}

/** Signed sideways distance of `point` from the line through the anchor. */
function sideOf(anchor: JunctionAnchor, point: BoardPoint) {
  const direction = { x: Math.cos(anchor.heading), z: Math.sin(anchor.heading) };

  return (point.x - anchor.position.x) * -direction.z + (point.z - anchor.position.z) * direction.x;
}

/**
 * Spreads the routes meeting at one junction into side-by-side lanes, ordered by which side of
 * the junction they head off to, so two lanes never cross.
 */
function laneOffsets(anchor: JunctionAnchor, routes: { id: RouteId; target: BoardPoint }[]) {
  const sorted = [...routes].sort((a, b) => sideOf(anchor, a.target) - sideOf(anchor, b.target));
  const middle = (sorted.length - 1) / 2;

  return new Map(sorted.map((route, index) => [route.id, (index - middle) * 2 * LANE_OFFSET]));
}

/**
 * Adds lane points at forks and merges, so the road splits and joins like a "Y":
 *
 * - **Fork** (a route continues into two or more): each branch starts with two points that run
 *   parallel to the fork tile, one lane to the left or right of it, then curves to its own path.
 * - **Merge** (two or more routes continue into one): each incoming route ends with two parallel
 *   lane points right behind the merge tile.
 *
 * Anchors come from the routes as written, so a route that is both a fork branch and a fork
 * source (none on this board) would use its unadjusted end.
 */
export function addJunctionLanes(
  specs: BoardRouteSpec[],
  anchors: { last: Map<RouteId, JunctionAnchor>; first: Map<RouteId, JunctionAnchor> },
): Map<RouteId, RouteGeometry> {
  const byId = new Map(specs.map((spec) => [spec.id, spec]));
  const geometry = new Map<RouteId, RouteGeometry>(
    specs.map((spec) => [spec.id, { path: [...spec.path], heading: null }]),
  );

  for (const spec of specs) {
    const single = spec.path.length === 1;

    if (single && spec.continuesTo.length > 0) {
      // A one-tile route points at the average of where its successors begin.
      const sum = spec.continuesTo.reduce(
        (total, id) => {
          const target = byId.get(id)?.path[0] ?? spec.path[0];

          return { x: total.x + target.x - spec.path[0].x, z: total.z + target.z - spec.path[0].z };
        },
        { x: 0, z: 0 },
      );
      const heading = Math.atan2(sum.z, sum.x);

      geometry.set(spec.id, { path: [...spec.path], heading });
      anchors.last.set(spec.id, { position: spec.path[0], heading });
    }
  }

  // Forks: prepend lanes to every branch.
  for (const spec of specs) {
    const anchor = anchors.last.get(spec.id);

    if (spec.continuesTo.length < 2 || !anchor) {
      continue;
    }

    const offsets = laneOffsets(
      anchor,
      spec.continuesTo.map((id) => ({ id, target: byId.get(id)?.path[0] ?? anchor.position })),
    );

    for (const branchId of spec.continuesTo) {
      const branch = geometry.get(branchId);
      const across = offsets.get(branchId) ?? 0;

      branch?.path.unshift(
        offsetPoint(anchor, LANE_LEAD, across),
        offsetPoint(anchor, LANE_LEAD + LANE_RUN, across),
      );
    }
  }

  // Merges: append lanes to every route that flows into a shared target.
  for (const target of specs) {
    const incoming = specs.filter(
      (spec) => spec.continuesTo.length === 1 && spec.continuesTo[0] === target.id,
    );
    const anchor = anchors.first.get(target.id);

    if (incoming.length < 2 || !anchor) {
      continue;
    }

    const offsets = laneOffsets(
      anchor,
      incoming.map((spec) => ({ id: spec.id, target: spec.path[spec.path.length - 1] })),
    );

    for (const spec of incoming) {
      const across = offsets.get(spec.id) ?? 0;

      geometry
        .get(spec.id)
        ?.path.push(
          offsetPoint(anchor, -(LANE_LEAD + LANE_RUN), across),
          offsetPoint(anchor, -LANE_LEAD, across),
        );
    }
  }

  return geometry;
}
