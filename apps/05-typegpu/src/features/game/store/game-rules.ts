import type { BoardBlueprint, TileId } from "../blueprint";

/** Spinner shows 1–10. */
export const SPIN_MIN = 1;
export const SPIN_MAX = 10;

export function rollSpin(random: () => number = Math.random) {
  return SPIN_MIN + Math.floor(random() * (SPIN_MAX - SPIN_MIN + 1));
}

/**
 * Fewest steps from every tile to the finish, found by walking the tile graph backwards from the
 * finish (breadth-first). Used for "Do mety: N pól" in the player panel.
 */
export function stepsToFinish(blueprint: BoardBlueprint): Record<TileId, number> {
  const previous = new Map<TileId, TileId[]>();

  for (const tile of blueprint.tiles) {
    for (const next of tile.next) {
      previous.set(next, [...(previous.get(next) ?? []), tile.id]);
    }
  }

  const distance = { [blueprint.finishTileId]: 0 } as Record<TileId, number>;
  const queue: TileId[] = [blueprint.finishTileId];

  while (queue.length > 0) {
    const current = queue.shift() as TileId;

    for (const source of previous.get(current) ?? []) {
      if (distance[source] === undefined) {
        distance[source] = distance[current] + 1;
        queue.push(source);
      }
    }
  }

  return distance;
}

export type StepOutcome =
  /** Moved one tile; keep going. */
  | { type: "moved"; tileId: TileId }
  /** Moved one tile and must stop here (out of steps, a stop tile, or the finish). */
  | { type: "landed"; tileId: TileId }
  /** Standing on a fork: the player has to pick a branch before moving on. */
  | { type: "fork"; options: TileId[] };

/**
 * One step of movement. A pawn stops early on any stop, career or enrollment tile it enters,
 * and at the finish.
 * `chosenTileId` is the branch picked at a fork; without it a fork returns `"fork"`.
 */
export function resolveStep(
  blueprint: BoardBlueprint,
  fromTileId: TileId,
  stepsLeft: number,
  chosenTileId?: TileId,
): StepOutcome {
  const from = blueprint.tilesById[fromTileId];

  if (from.next.length > 1 && !chosenTileId) {
    return { type: "fork", options: from.next };
  }

  const tileId = chosenTileId ?? from.next[0];
  const tile = blueprint.tilesById[tileId];
  // Career tiles and enrollment are mandatory stops too: nobody drives past their first job,
  // and nobody gets into college without paying tuition.
  const mustStop =
    stepsLeft <= 1 ||
    tile.kind === "stop" ||
    tile.kind === "career" ||
    tile.action === "enroll" ||
    tile.next.length === 0;

  return mustStop ? { type: "landed", tileId } : { type: "moved", tileId };
}
