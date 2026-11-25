import { instances, type meshPool } from "@typegpu/kit";
import { meshes } from "@typegpu/kit/geometry";
import { d, std, type TgpuReadonly, type TgpuRoot } from "typegpu";

import { CELL, CELLS, SPAN } from "@/world/layout";

import { Ground } from "./colour";

export function createMesh(
  root: TgpuRoot,
  pool: meshPool.MeshPool,
  heights: TgpuReadonly<d.WgslArray<d.F32>>,
) {
  const heightOf = (column: number, row: number) => {
    "use gpu";
    const kept = std.clamp(d.vec2i(column, row), d.vec2i(0), d.vec2i(CELLS - 1));

    return heights.$[kept.y * CELLS + kept.x];
  };

  // Rows run toward -z, as the kit's parametric planes expect, so v = 0 is the far edge
  const shape = meshes.parametric(
    {
      at: (u, v) => {
        "use gpu";
        const column = d.i32(std.round(u * (CELLS - 1)));
        const row = d.i32(CELLS - 1) - d.i32(std.round(v * (CELLS - 1)));

        return d.vec3f((u - 0.5) * SPAN, heightOf(column, row), (0.5 - v) * SPAN);
      },
      normalAt: (u, v) => {
        "use gpu";
        const column = d.i32(std.round(u * (CELLS - 1)));
        const row = d.i32(CELLS - 1) - d.i32(std.round(v * (CELLS - 1)));
        const dx = heightOf(column + 1, row) - heightOf(column - 1, row);
        const dz = heightOf(column, row + 1) - heightOf(column, row - 1);

        return std.normalize(d.vec3f(-dx, 2 * CELL, -dz));
      },
    },
    { cols: CELLS - 1, rows: CELLS - 1 },
  );

  const mesh = pool.add(shape);
  const field = instances.create(root, pool, { kind: Ground, capacity: 1 });
  field.add(mesh);
  field.flush();

  return field;
}
