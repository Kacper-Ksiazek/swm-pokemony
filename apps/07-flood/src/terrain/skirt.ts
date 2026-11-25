import { srgbToLinear } from "@typegpu/color";
import { cameras, materials, passes, shading } from "@typegpu/kit";
import { perlin2d } from "@typegpu/noise";
import { d, std, type TgpuReadonly } from "typegpu";

import { EDGE_VERTICES, edgeVertexOf, placeOf } from "@/edges";
import { CELLS } from "@/world/layout";

const TOPSOIL = srgbToLinear(d.vec3f(0.3, 0.22, 0.15));
const CLAY = srgbToLinear(d.vec3f(0.52, 0.4, 0.28));
const BEDROCK = srgbToLinear(d.vec3f(0.5, 0.47, 0.42));
/** Where the model's soil walls end, in metres below calm sea level. */
const BASE = -6;

export function createSkirt(heights: TgpuReadonly<d.WgslArray<d.F32>>) {
  const heightOf = (column: number, row: number) => {
    "use gpu";
    const kept = std.clamp(d.vec2i(column, row), d.vec2i(0), d.vec2i(CELLS - 1));

    return heights.$[kept.y * CELLS + kept.x];
  };

  const Wall = d.struct({ position: d.vec4f, world: d.vec3f, normal: d.vec3f, below: d.f32 });
  const Seen = d.struct({ color: d.vec4f });

  /** The cut through the land along each side of the map: topsoil, clay, then rock. */
  const skirt = passes.drawing({
    label: "soil walls",
    Vertex: Wall,
    at: (vertexIndex: number) => {
      "use gpu";
      const edge = edgeVertexOf(vertexIndex);
      const top = heightOf(edge.cell.x, edge.cell.y);
      const y = std.mix(d.f32(BASE), top, edge.top);
      const world = d.vec3f(placeOf(edge.cell).x, y, placeOf(edge.cell).y);

      return Wall({
        position: cameras.toClip(world),
        world,
        normal: d.vec3f(edge.normal),
        below: top - y,
      });
    },
    pixelOf: (wall) => {
      "use gpu";
      const along = wall.world.x + wall.world.z;
      const wobble = perlin2d.sample(d.vec2f(along * 0.15, wall.world.y * 0.4)) * 0.5;
      const depth = wall.below + wobble;
      let color = std.mix(TOPSOIL, CLAY, std.smoothstep(0.4, 1.2, depth));
      color = std.mix(color, BEDROCK, std.smoothstep(2.5, 4, depth));
      const grain = perlin2d.sample(d.vec2f(along * 1.7, wall.world.y * 2.3)) * 0.08;
      const soil = materials.matte(color * (1 + grain));

      return Seen({
        color: d.vec4f(shading.shade(soil, shading.pointAt(wall.world, wall.normal)), 1),
      });
    },
    color: passes.shaded,
    primitive: { cullMode: "none" },
    draw: (pass) => pass.draw(EDGE_VERTICES),
  });

  return skirt;
}
