import { srgbToLinear } from "@typegpu/color";
import { cameras, instances, materials, passes, shading, type meshPool } from "@typegpu/kit";
import { meshes } from "@typegpu/kit/geometry";
import { perlin2d } from "@typegpu/noise";
import { d, std, type StorageFlag, type TgpuBuffer, type TgpuRoot } from "typegpu";

import { EDGE_VERTICES, edgeVertexOf, placeOf } from "@/edges";
import { BLOCK, CELL, CELLS, ISLET, PROMENADE, ROAD, SPAN, TOWN } from "@/world/layout";

const SAND = srgbToLinear(d.vec3f(0.86, 0.78, 0.6));
const GRASS = srgbToLinear(d.vec3f(0.42, 0.52, 0.3));
const MEADOW = srgbToLinear(d.vec3f(0.55, 0.58, 0.34));
const ASPHALT = srgbToLinear(d.vec3f(0.16, 0.16, 0.17));
const KERB = srgbToLinear(d.vec3f(0.5, 0.5, 0.48));
const ROCK = srgbToLinear(d.vec3f(0.46, 0.43, 0.4));
const STONE = srgbToLinear(d.vec3f(0.85, 0.8, 0.72));
const SEABED = srgbToLinear(d.vec3f(0.42, 0.4, 0.33));
const TOPSOIL = srgbToLinear(d.vec3f(0.3, 0.22, 0.15));
const CLAY = srgbToLinear(d.vec3f(0.52, 0.4, 0.28));
const BEDROCK = srgbToLinear(d.vec3f(0.5, 0.47, 0.42));
/** Where the model's soil walls end, in metres below calm sea level. */
const BASE = -6;

/** The road grid from `isRoad` in the layout, with a light kerb along each edge. */
const roadAt = (place: d.v2f) => {
  "use gpu";
  const inside =
    place.x >= TOWN.minX && place.x <= TOWN.maxX && place.y >= TOWN.minZ && place.y <= TOWN.maxZ;
  if (!inside) {
    return d.vec2f(0, 0);
  }
  const along = (place - d.vec2f(TOWN.minX, TOWN.minZ)) % BLOCK;
  const road = std.max(std.step(along.x, ROAD), std.step(along.y, ROAD));
  const nearest = std.min(along, d.vec2f(ROAD) - along);
  const edge = std.step(std.min(nearest.x, nearest.y), 0.3);
  return d.vec2f(road, edge);
};

/** Seabed under the water, sand on the beach, patchy grass inland, asphalt on the roads. */
const Ground = instances.define("Ground", {
  material: (pixel) => {
    "use gpu";
    const at = pixel.point.position.xz;
    const patches = perlin2d.sample(at * 0.08) * 0.5 + 0.5;
    let color = std.mix(GRASS, MEADOW, patches);
    // Sand up to the promenade, then pale stone slabs along it
    const beach = std.smoothstep(PROMENADE.near + 1, PROMENADE.near - 1, at.y);
    color = std.mix(color, SAND, beach);
    const promenade =
      std.step(PROMENADE.near, at.y) *
      std.step(at.y, PROMENADE.far) *
      std.step(std.abs(at.x), TOWN.maxX);
    const slab = std.fract(at * d.vec2f(0.5, 0.5));
    const joint = std.max(std.step(0.95, slab.x), std.step(0.95, slab.y));
    color = std.mix(color, std.mix(STONE, KERB, joint * 0.6), promenade);
    color = std.mix(color, SEABED, std.smoothstep(0.2, -1.5, pixel.point.position.y));
    // The islet is bare rock, darker where the sea wets it
    const islet = std.smoothstep(
      ISLET.radius * 1.3,
      ISLET.radius * 0.9,
      std.distance(at, d.vec2f(ISLET.x, ISLET.z)),
    );
    const rock = std.mix(ROCK, SEABED, std.smoothstep(0.6, -0.4, pixel.point.position.y));
    color = std.mix(color, rock * (0.85 + patches * 0.3), islet);
    const road = roadAt(at);
    color = std.mix(color, ASPHALT, road.x);
    color = std.mix(color, KERB, road.x * road.y);
    return materials.matte(color * (0.92 + perlin2d.sample(at * 0.9) * 0.08));
  },
});

type HeightBuffer = TgpuBuffer<d.WgslArray<d.F32>> & StorageFlag;

/** Bakes the terrain mesh from the ground heights the water also reads. */
export function createTerrain(root: TgpuRoot, pool: meshPool.MeshPool, ground: HeightBuffer) {
  const heights = ground.as("readonly");

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

  return {
    renderer: field.renderer(),
    skirt,
    destroy() {
      field.destroy();
    },
  };
}
