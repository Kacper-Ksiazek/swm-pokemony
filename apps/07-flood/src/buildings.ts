import { srgbToLinear } from "@typegpu/color";
import { instances, materials, type meshPool } from "@typegpu/kit";
import { meshes } from "@typegpu/kit/geometry";
import { randf } from "@typegpu/noise";
import { d, std, type TgpuRoot } from "typegpu";

import { FALL_SECONDS, RUBBLE, type Fall } from "@/world/collapse";
import { HOME_WINDOWS, NO_WINDOWS, type Building, type Part } from "@/world/layout";

/** Colour a fallen building takes under its own dust. */
const DUST = [0.42, 0.39, 0.35] as const;
/** How far a building leans toward the push before it has crumbled, in radians. */
const LEAN = 0.45;
/** How much wider than the building its heap spreads. */
const SPREAD = 0.35;

/** Window glass by day, and the warm light of a lived-in room. */
const GLASS = srgbToLinear(d.vec3f(0.12, 0.15, 0.18));
const ROOM = srgbToLinear(d.vec3f(1, 0.72, 0.42));
const OFFICE = srgbToLinear(d.vec3f(0.9, 0.92, 1));

/** How many windows are lit and how brightly, which the time of day sets. */
export const Evening = d.struct({ lit: d.f32, glow: d.f32 });

const mix = (a: number, b: number, t: number) => a + (b - a) * t;

type Quaternion = readonly [number, number, number, number];
const IDENTITY: Quaternion = [0, 0, 0, 1];

const multiply = (a: Quaternion, b: Quaternion): Quaternion => [
  a[3] * b[0] + a[0] * b[3] + a[1] * b[2] - a[2] * b[1],
  a[3] * b[1] - a[0] * b[2] + a[1] * b[3] + a[2] * b[0],
  a[3] * b[2] + a[0] * b[1] - a[1] * b[0] + a[2] * b[3],
  a[3] * b[3] - a[0] * b[0] - a[1] * b[1] - a[2] * b[2],
];

const rotate = (q: Quaternion, [x, y, z]: readonly [number, number, number]) => {
  // v + 2 w (u x v) + 2 u x (u x v)
  const [ux, uy, uz, w] = q;
  const cx = uy * z - uz * y;
  const cy = uz * x - ux * z;
  const cz = ux * y - uy * x;
  return [
    x + 2 * (w * cx + uy * cz - uz * cy),
    y + 2 * (w * cy + uz * cx - ux * cz),
    z + 2 * (w * cz + ux * cy - uy * cx),
  ] as const;
};

/** A gable roof is a box turned 45 degrees about its ridge, its lower half inside the walls. */
const turnOf = (part: Part): Quaternion => {
  const half = Math.sin(Math.PI / 8);
  const whole = Math.cos(Math.PI / 8);
  if (part.ridge === "z") return [0, 0, half, whole];
  if (part.ridge === "x") return [half, 0, 0, whole];
  return IDENTITY;
};

/**
 * The town's buildings, each drawn as its parts: walls, roofs, cornices, tiers and masts. Windows
 * are painted onto the walls in the shader, in rows by storey, and at dusk some of them light up.
 * A falling building tips and crumbles as one, every part with it.
 */
export function createBuildings(
  root: TgpuRoot,
  pool: meshPool.MeshPool,
  buildings: readonly Building[],
) {
  const evening = root.createUniform(Evening, { lit: 0, glow: 0 });

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

  const box = pool.add(meshes.box());
  const blocks = instances.create(root, pool, {
    kind: Facade,
    capacity: buildings.reduce((sum, building) => sum + building.parts.length, 0),
  });
  /** Buildings whose fall has run to the end, which need no more writes. */
  const settled = new Set<number>();

  const placed = (building: Building, part: Part) => ({
    position: [building.x + part.x, building.base + part.y, building.z + part.z] as const,
    rotation: turnOf(part),
    scale: [part.width, part.height, part.depth] as const,
  });

  const rows = buildings.map((building, index) =>
    building.parts.map((part) =>
      blocks.add(box, {
        ...placed(building, part),
        color: part.color,
        roughness: 0.85,
        windows: part.windows,
        storey: part.storey,
        bottom: building.base + part.y - part.height / 2,
        seed: index + 1,
        ruined: 0,
      }),
    ),
  );
  blocks.flush();

  return {
    renderer: blocks.renderer(),
    evening,

    /**
     * Moves every falling building to where it is at `time`: it leans toward the push faster and
     * faster, while it crumbles down to a wide, low heap of dusty rubble.
     */
    update(falls: readonly (Fall | undefined)[], time: number) {
      for (let i = 0; i < buildings.length; i++) {
        const fall = falls[i];
        if (!fall || settled.has(i)) continue;
        const building = buildings[i];
        const t = Math.min(Math.max((time - fall.since) / FALL_SECONDS, 0), 1);
        const p = t * t;
        const [x, z] = fall.toward;

        const squash = mix(1, RUBBLE / building.height, p);
        const angle = LEAN * Math.sin(t * Math.PI * 0.5) * (1 - p * 0.6);
        const half = Math.sin(angle / 2);
        // A turn about the horizontal axis across the push, so the top tips toward it
        const lean: Quaternion = [z * half, 0, -x * half, Math.cos(angle / 2)];
        const shift = p * building.height * 0.25;
        const grow = 1 + SPREAD * p;
        const dust = p * 0.8;

        building.parts.forEach((part, j) => {
          const offset = rotate(lean, [part.x * grow, part.y * squash, part.z * grow]);
          blocks.write(rows[i][j], {
            position: [
              building.x + x * shift + offset[0],
              building.base + offset[1],
              building.z + z * shift + offset[2],
            ],
            rotation: multiply(lean, turnOf(part)),
            scale: [part.width * grow, Math.max(part.height * squash, 0.2), part.depth * grow],
            color: [
              mix(part.color[0], DUST[0], dust),
              mix(part.color[1], DUST[1], dust),
              mix(part.color[2], DUST[2], dust),
            ],
            ruined: 1,
          });
        });
        if (t >= 1) settled.add(i);
      }
      blocks.flush();
    },

    /** Stands every building up again. */
    reset() {
      settled.clear();
      buildings.forEach((building, i) =>
        building.parts.forEach((part, j) =>
          blocks.write(rows[i][j], { ...placed(building, part), color: part.color, ruined: 0 }),
        ),
      );
      blocks.flush();
    },

    destroy() {
      blocks.destroy();
    },
  };
}
