import * as THREE from "three/webgpu";

import type { BoardBlueprint, TileId } from "../../../blueprint";
import type { VehicleId } from "../../../vehicles";
import { createVehicleMesh } from "./vehicle-meshes";
import { TILE_HEIGHT } from "./scene.constants";
import { TILE_HEIGHT_SCALE } from "./tile-palette";

export type PawnState = {
  id: number;
  vehicleId: VehicleId;
  color: string;
  tileId: TileId;
};

type Pawn = {
  vehicleId: VehicleId;
  color: string;
  tileId: TileId;
  object: THREE.Group;
  position: THREE.Vector3;
  heading: number;
};

/** Where up to four vehicles park on one tile, in tile space (x along the road, z across). */
const SLOTS: [number, number][] = [
  [0.14, -0.2],
  [-0.14, 0.2],
  [0.14, 0.2],
  [-0.14, -0.2],
];

/** Smallest signed difference between two angles. */
function angleDelta(from: number, to: number) {
  return Math.atan2(Math.sin(to - from), Math.cos(to - from));
}

/**
 * The players' vehicles on the board. `sync` tells every pawn which tile it belongs on; `update`
 * slides it there each frame with a small hop, so a move of several tiles reads as driving.
 */
export function createPawnLayer(blueprint: BoardBlueprint) {
  const group = new THREE.Group();
  const pawns = new Map<number, Pawn>();
  let activeId: number | null = null;

  const targetOf = (pawn: Pawn, slot: [number, number] | null) => {
    const tile = blueprint.tilesById[pawn.tileId];
    const [along, across] = slot ?? [0, 0];
    const cos = Math.cos(tile.heading);
    const sin = Math.sin(tile.heading);

    return new THREE.Vector3(
      tile.position.x + cos * along - sin * across,
      TILE_HEIGHT * TILE_HEIGHT_SCALE[tile.kind],
      tile.position.z + sin * along + cos * across,
    );
  };

  /** Pawns sharing a tile spread over SLOTS; a lone pawn parks in the middle. */
  const slotsByPawn = () => {
    const byTile = new Map<TileId, number[]>();

    for (const [id, pawn] of pawns) {
      byTile.set(pawn.tileId, [...(byTile.get(pawn.tileId) ?? []), id]);
    }

    const slots = new Map<number, [number, number] | null>();

    for (const ids of byTile.values()) {
      ids.forEach((id, index) =>
        slots.set(id, ids.length === 1 ? null : SLOTS[index % SLOTS.length]),
      );
    }

    return slots;
  };

  const sync = (states: PawnState[], currentId: number | null) => {
    activeId = currentId;

    for (const [id, pawn] of pawns) {
      const state = states.find((candidate) => candidate.id === id);

      if (!state || state.vehicleId !== pawn.vehicleId || state.color !== pawn.color) {
        group.remove(pawn.object);
        pawns.delete(id);
      }
    }

    for (const state of states) {
      const existing = pawns.get(state.id);

      if (existing) {
        existing.tileId = state.tileId;
        continue;
      }

      const object = createVehicleMesh(state.vehicleId, state.color);
      const pawn: Pawn = {
        vehicleId: state.vehicleId,
        color: state.color,
        tileId: state.tileId,
        object,
        position: new THREE.Vector3(),
        heading: blueprint.tilesById[state.tileId].heading,
      };

      pawn.position.copy(targetOf(pawn, null));
      pawns.set(state.id, pawn);
      group.add(object);
    }
  };

  const update = (deltaSeconds: number, timeSeconds: number) => {
    const slots = slotsByPawn();
    const follow = 1 - Math.exp(-deltaSeconds * 9);

    for (const [id, pawn] of pawns) {
      const target = targetOf(pawn, slots.get(id) ?? null);
      const remaining = Math.hypot(target.x - pawn.position.x, target.z - pawn.position.z);

      pawn.position.lerp(target, follow);
      pawn.heading += angleDelta(pawn.heading, blueprint.tilesById[pawn.tileId].heading) * follow;

      const hop = Math.min(0.3, remaining * 0.5);
      const bob = id === activeId ? Math.sin(timeSeconds * 4) * 0.03 + 0.03 : 0;

      pawn.object.position.set(pawn.position.x, pawn.position.y + hop + bob, pawn.position.z);
      pawn.object.rotation.y = -pawn.heading;
      pawn.object.scale.setScalar(id === activeId ? 1.15 : 1);
    }
  };

  const positionOf = (id: number) => pawns.get(id)?.position ?? null;

  return { group, sync, update, positionOf };
}
