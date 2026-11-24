import { instances, type meshPool } from "@typegpu/kit";
import type { TgpuRoot } from "typegpu";

import { LEVEL_01, type BlockSpec } from "@/level.ts";

export function createStructures(root: TgpuRoot, pool: meshPool.MeshPool, brick: meshPool.Mesh) {
  const field = instances.create(root, pool, { capacity: LEVEL_01.length });

  for (const block of LEVEL_01) {
    field.add(brick, toInstance(block));
  }
  field.flush();

  return {
    renderer: field.renderer(),
    destroy() {
      field.destroy();
    },
  };
}

function toInstance(block: BlockSpec) {
  return {
    position: block.position,
    rotation: [0, 0, 0, 1] as const,
    scale: block.scale,
    color: block.color,
    roughness: block.roughness ?? 0.88,
  };
}
