import * as THREE from "three/webgpu";

import type { BoardBlueprint, BoardPoint } from "../../../blueprint";
import { FIELD_RANGE, FIELD_RESOLUTION, SPINNER_POSITION, SPINNER_RADIUS } from "./scene.constants";

/** Distance from a point to the nearest tile center or the spinner base edge, in board units. */
function distanceToLand(point: BoardPoint, blueprint: BoardBlueprint) {
  let nearest = Math.hypot(point.x - SPINNER_POSITION.x, point.z - SPINNER_POSITION.z);

  nearest = Math.max(0, nearest - SPINNER_RADIUS - 0.4);

  for (const tile of blueprint.tiles) {
    nearest = Math.min(nearest, Math.hypot(point.x - tile.position.x, point.z - tile.position.z));
  }

  return nearest;
}

/**
 * Bakes "how far is the nearest road" into a small texture once, on the CPU. The terrain shader
 * samples it to decide where grass, sand, and water go, so islands follow the roads on any layout.
 *
 * Texel (i, j) covers world x = (i + 0.5) / N · side − side / 2 and the same for z with j. The
 * shader maps world X/Z to UV the same way.
 */
export function createTerrainField(blueprint: BoardBlueprint) {
  const size = FIELD_RESOLUTION;
  const side = blueprint.size.width;
  const data = new Uint8Array(size * size * 4);

  for (let j = 0; j < size; j += 1) {
    for (let i = 0; i < size; i += 1) {
      const point = {
        x: ((i + 0.5) / size) * side - side / 2,
        z: ((j + 0.5) / size) * side - side / 2,
      };
      const normalized = Math.min(1, distanceToLand(point, blueprint) / FIELD_RANGE);
      const offset = (j * size + i) * 4;

      data[offset] = Math.round(normalized * 255);
      data[offset + 3] = 255;
    }
  }

  const texture = new THREE.DataTexture(data, size, size, THREE.RGBAFormat);

  texture.magFilter = THREE.LinearFilter;
  texture.minFilter = THREE.LinearFilter;
  texture.colorSpace = THREE.NoColorSpace;
  texture.needsUpdate = true;

  return texture;
}
