import * as THREE from "three/webgpu";

import type { BoardBlueprint, BoardPoint, BoardTile, TileId } from "../../../blueprint";
import { TILE_SPACING } from "../../../blueprint";
import { TILE_GAP, TILE_HEIGHT, TILE_WIDTH } from "./scene.constants";
import { TILE_COLORS, TILE_HEIGHT_SCALE } from "./tile-palette";

/** A line across the road where one tile ends and the next begins. */
type Cut = {
  center: BoardPoint;
  /** Unit vector across the road, pointing to the left of the travel direction. */
  across: BoardPoint;
};

type Vec3 = [number, number, number];

function cutBetween(from: BoardPoint, to: BoardPoint): Cut {
  const length = Math.hypot(to.x - from.x, to.z - from.z);
  const along = { x: (to.x - from.x) / length, z: (to.z - from.z) / length };

  return {
    center: { x: (from.x + to.x) / 2, z: (from.z + to.z) / 2 },
    across: { x: along.z, z: -along.x },
  };
}

/** Straight end half a tile away from the center, used where the road forks or merges. */
function straightCut(tile: BoardTile, direction: 1 | -1): Cut {
  const along = { x: Math.cos(tile.heading), z: Math.sin(tile.heading) };

  return {
    center: {
      x: tile.position.x + (along.x * direction * TILE_SPACING) / 2,
      z: tile.position.z + (along.z * direction * TILE_SPACING) / 2,
    },
    across: { x: along.z, z: -along.x },
  };
}

/** Moves a cut toward the tile center so neighbours keep a thin groove between them. */
function insetCut(cut: Cut, tile: BoardTile): Cut {
  const toCenter = { x: tile.position.x - cut.center.x, z: tile.position.z - cut.center.z };
  const length = Math.hypot(toCenter.x, toCenter.z) || 1;

  return {
    center: {
      x: cut.center.x + (toCenter.x / length) * (TILE_GAP / 2),
      z: cut.center.z + (toCenter.z / length) * (TILE_GAP / 2),
    },
    across: cut.across,
  };
}

/**
 * Tiles where the road is one simple chain: exactly one way in and one way out.
 * Only between such pairs do two tiles share a cut, so their edges line up on curves.
 */
function chainLinks(blueprint: BoardBlueprint) {
  const incoming = new Map<TileId, TileId[]>();

  for (const tile of blueprint.tiles) {
    for (const next of tile.next) {
      incoming.set(next, [...(incoming.get(next) ?? []), tile.id]);
    }
  }

  const previousOf = (tile: BoardTile) => {
    const sources = incoming.get(tile.id) ?? [];
    const source = sources.length === 1 ? blueprint.tilesById[sources[0]] : null;

    return source && source.next.length === 1 ? source : null;
  };

  const nextOf = (tile: BoardTile) => {
    const target = tile.next.length === 1 ? blueprint.tilesById[tile.next[0]] : null;

    return target && (incoming.get(target.id) ?? []).length === 1 ? target : null;
  };

  return { previousOf, nextOf };
}

/**
 * One merged mesh for the whole road. Each tile is a slab whose ends are the cuts halfway to its
 * neighbours, so on a curve it becomes a trapezoid (wider on the outside of the bend) and the
 * road reads as one continuous ribbon instead of overlapping squares.
 *
 * Attributes: `position`, flat `normal`, `color` (tile kind, linear), and `uv` on the top face
 * (u across the road, v along it) for the tile shader.
 */
export function createTileGeometry(blueprint: BoardBlueprint) {
  const { previousOf, nextOf } = chainLinks(blueprint);
  const positions: number[] = [];
  const normals: number[] = [];
  const colors: number[] = [];
  const uvs: number[] = [];
  const color = new THREE.Color();

  const pushTriangle = (
    corners: [Vec3, Vec3, Vec3],
    cornerUvs: [number, number][],
    outward: Vec3,
  ) => {
    const [a, b, c] = corners;
    const ab: Vec3 = [b[0] - a[0], b[1] - a[1], b[2] - a[2]];
    const ac: Vec3 = [c[0] - a[0], c[1] - a[1], c[2] - a[2]];
    let normal: Vec3 = [
      ab[1] * ac[2] - ab[2] * ac[1],
      ab[2] * ac[0] - ab[0] * ac[2],
      ab[0] * ac[1] - ab[1] * ac[0],
    ];
    let order = [0, 1, 2];

    // Front faces must point away from the tile, whatever order the corners came in.
    if (normal[0] * outward[0] + normal[1] * outward[1] + normal[2] * outward[2] < 0) {
      order = [0, 2, 1];
      normal = [-normal[0], -normal[1], -normal[2]];
    }

    const length = Math.hypot(...normal) || 1;

    for (const index of order) {
      positions.push(...corners[index]);
      normals.push(normal[0] / length, normal[1] / length, normal[2] / length);
      colors.push(color.r, color.g, color.b);
      uvs.push(...cornerUvs[index]);
    }
  };

  for (const tile of blueprint.tiles) {
    const previous = previousOf(tile);
    const next = nextOf(tile);
    const back = insetCut(
      previous ? cutBetween(previous.position, tile.position) : straightCut(tile, -1),
      tile,
    );
    const front = insetCut(
      next ? cutBetween(tile.position, next.position) : straightCut(tile, 1),
      tile,
    );
    const halfWidth = TILE_WIDTH / 2;
    const height = TILE_HEIGHT * TILE_HEIGHT_SCALE[tile.kind];

    color.setHex(TILE_COLORS[tile.kind]);

    const corner = ({ center, across }: Cut, side: 1 | -1) => ({
      x: center.x + across.x * halfWidth * side,
      z: center.z + across.z * halfWidth * side,
    });
    // Corners on the table plane: back-left, back-right, front-right, front-left.
    const corners = [corner(back, 1), corner(back, -1), corner(front, -1), corner(front, 1)];
    const top = corners.map((corner): Vec3 => [corner.x, height, corner.z]);
    const bottom = corners.map((corner): Vec3 => [corner.x, 0, corner.z]);
    const topUvs: [number, number][] = [
      [0, 0],
      [1, 0],
      [1, 1],
      [0, 1],
    ];
    const noUv: [number, number][] = [
      [0, 0],
      [0, 0],
      [0, 0],
    ];

    pushTriangle([top[0], top[1], top[2]], [topUvs[0], topUvs[1], topUvs[2]], [0, 1, 0]);
    pushTriangle([top[0], top[2], top[3]], [topUvs[0], topUvs[2], topUvs[3]], [0, 1, 0]);

    for (let edge = 0; edge < 4; edge += 1) {
      const nextEdge = (edge + 1) % 4;
      const mid = {
        x: (corners[edge].x + corners[nextEdge].x) / 2,
        z: (corners[edge].z + corners[nextEdge].z) / 2,
      };
      const outward: Vec3 = [mid.x - tile.position.x, 0, mid.z - tile.position.z];

      pushTriangle([bottom[edge], bottom[nextEdge], top[nextEdge]], noUv, outward);
      pushTriangle([bottom[edge], top[nextEdge], top[edge]], noUv, outward);
    }
  }

  const geometry = new THREE.BufferGeometry();

  geometry.setAttribute("position", new THREE.Float32BufferAttribute(positions, 3));
  geometry.setAttribute("normal", new THREE.Float32BufferAttribute(normals, 3));
  geometry.setAttribute("color", new THREE.Float32BufferAttribute(colors, 3));
  geometry.setAttribute("uv", new THREE.Float32BufferAttribute(uvs, 2));
  geometry.computeBoundingSphere();

  return geometry;
}
