import { srgbToLinear } from "@typegpu/color";
import { instances, materials } from "@typegpu/kit";
import { perlin2d } from "@typegpu/noise";
import { d, std } from "typegpu";

import { BLOCK, ISLET, PROMENADE, ROAD, TOWN } from "@/world/layout";

const SAND = srgbToLinear(d.vec3f(0.86, 0.78, 0.6));
const GRASS = srgbToLinear(d.vec3f(0.42, 0.52, 0.3));
const MEADOW = srgbToLinear(d.vec3f(0.55, 0.58, 0.34));
const ASPHALT = srgbToLinear(d.vec3f(0.16, 0.16, 0.17));
const KERB = srgbToLinear(d.vec3f(0.5, 0.5, 0.48));
const ROCK = srgbToLinear(d.vec3f(0.46, 0.43, 0.4));
const STONE = srgbToLinear(d.vec3f(0.85, 0.8, 0.72));
const SEABED = srgbToLinear(d.vec3f(0.42, 0.4, 0.33));

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
export const Ground = instances.define("Ground", {
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
