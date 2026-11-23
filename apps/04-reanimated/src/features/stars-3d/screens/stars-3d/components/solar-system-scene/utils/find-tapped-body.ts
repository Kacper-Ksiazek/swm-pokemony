import type { ProjectedBody } from "../../../projection";
import {
  BODY_COUNT,
  BODY_SIZES,
  HIT_PADDING_PX,
  IS_SATELLITE,
  MIN_HIT_RADIUS_PX,
  MIN_SATELLITE_DISTANT_HIT_RADIUS_PX,
} from "../solar-system-scene.constants";

/**
 * Returns the index of the closest visible body under `(tapX, tapY)` in centered
 * viewport coordinates, or `-1` when nothing is hit. Distant satellites use a
 * smaller floor so they do not steal taps meant for their host planet.
 */
export function findTappedBody(tapX: number, tapY: number, projections: ProjectedBody[]): number {
  "worklet";

  let hitIndex = -1;
  let closestDepth = Infinity;

  for (let i = 0; i < BODY_COUNT; i += 1) {
    const point = projections[i];

    if (!point || point.depth <= 0) {
      continue;
    }

    const visualRadius = (BODY_SIZES[i] / 2) * point.scale;
    const minHitRadius =
      IS_SATELLITE[i] && visualRadius < 3 ? MIN_SATELLITE_DISTANT_HIT_RADIUS_PX : MIN_HIT_RADIUS_PX;
    const hitRadius = Math.max(visualRadius + HIT_PADDING_PX, minHitRadius);
    const dx = tapX - point.x;
    const dy = tapY - point.y;

    if (dx * dx + dy * dy <= hitRadius * hitRadius && point.depth < closestDepth) {
      closestDepth = point.depth;
      hitIndex = i;
    }
  }

  return hitIndex;
}
