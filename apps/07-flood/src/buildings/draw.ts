import { srgbToLinear } from "@typegpu/color";
import { instances, materials } from "@typegpu/kit";
import { randf } from "@typegpu/noise";
import { d, std, type TgpuUniform } from "typegpu";

import { HOME_WINDOWS, NO_WINDOWS } from "@/world/layout";

/** Window glass by day, and the warm light of a lived-in room. */
const GLASS = srgbToLinear(d.vec3f(0.12, 0.15, 0.18));
const ROOM = srgbToLinear(d.vec3f(1, 0.72, 0.42));
const OFFICE = srgbToLinear(d.vec3f(0.9, 0.92, 1));

/** How many windows are lit and how brightly, which the time of day sets. */
export const Evening = d.struct({ lit: d.f32, glow: d.f32 });

/**
 * Windows are painted onto the walls in the shader, in rows by storey, and at dusk some of them
 * light up.
 */
export function createDraw(evening: TgpuUniform<typeof Evening>) {
  const Facade = instances.define("Facade", {
    host: { windows: d.u32, storey: d.f32, bottom: d.f32, seed: d.f32, ruined: d.u32 },
    material: (pixel) => {
      "use gpu";
      const part = pixel.instance;
      const point = pixel.point;
      // Taken before any branch: how far a window cell spans across one pixel
      const along = std.dot(point.position.xz, d.vec2f(-point.normal.z, point.normal.x));
      const up = point.position.y - part.bottom;
      const spacing = std.select(1.8, 2.6, part.windows === HOME_WINDOWS);
      const grid = d.vec2f(along / spacing, up / part.storey);
      const blur = std.fwidth(grid) * 1.5;

      const wall = materials.matte(part.color);

      if (part.ruined === 1 || part.windows === NO_WINDOWS || std.abs(point.normal.y) > 0.5) {
        return wall;
      }

      const cell = std.floor(grid);
      const inside = grid - cell;
      // A home's window is a square hole in plaster; an office's glazing runs in bands
      let low = d.vec2f(0.08, 0.2);
      let high = d.vec2f(0.92, 0.86);
      if (part.windows === HOME_WINDOWS) {
        low = d.vec2f(0.3, 0.34);
        high = d.vec2f(0.7, 0.8);
      }
      const across =
        std.smoothstep(low - blur, low + blur, inside) *
        (d.vec2f(1) - std.smoothstep(high - blur, high + blur, inside));
      // Far away the pattern is finer than a pixel: blend to the average of wall and glass
      const fade = std.saturate(2 - std.max(blur.x, blur.y) * 3);
      const glazed = across.x * across.y * fade + (1 - fade) * 0.25;

      if (glazed <= 0.001) {
        return wall;
      }

      randf.seed3(d.vec3f(cell, part.seed * 97));
      const lit = std.select(0, 1, randf.sample() < evening.$.lit);
      const warmth = std.select(OFFICE, ROOM, part.windows === HOME_WINDOWS);
      const glass = materials.glossy(GLASS, 0.08);
      glass.emission = warmth * (lit * evening.$.glow * (0.6 + randf.sample() * 0.8));
      const look = materials.matte(std.mix(wall.color, glass.color, glazed));
      look.roughness = std.mix(wall.roughness, glass.roughness, glazed);
      look.emission = glass.emission * glazed;

      return look;
    },
  });

  return Facade;
}
