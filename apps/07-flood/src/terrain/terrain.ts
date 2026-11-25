import type { meshPool } from "@typegpu/kit";
import { d, type StorageFlag, type TgpuBuffer, type TgpuRoot } from "typegpu";

import { createMesh } from "./mesh";
import { createSkirt } from "./skirt";

type HeightBuffer = TgpuBuffer<d.WgslArray<d.F32>> & StorageFlag;

/** Bakes the terrain mesh from the ground heights the water also reads. */
export function createTerrain(root: TgpuRoot, pool: meshPool.MeshPool, ground: HeightBuffer) {
  const heights = ground.as("readonly");
  const field = createMesh(root, pool, heights);
  const skirt = createSkirt(heights);

  return {
    renderer: field.renderer(),
    skirt,
    destroy() {
      field.destroy();
    },
  };
}
