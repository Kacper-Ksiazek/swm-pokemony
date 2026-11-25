import { srgbToLinear } from "@typegpu/color";
import { instances, materials, type meshPool } from "@typegpu/kit";
import { meshes } from "@typegpu/kit/geometry";
import type { TgpuReadonly, TgpuRoot, TgpuUniform } from "typegpu";
import { d, std } from "typegpu";

import type { Evening } from "@/buildings";
import { BUOY, MOTORBOAT, type Mooring } from "@/world/beach";
import type { Color } from "@/world/layout";

import { Sea, type Slots } from "./step";

/** What a slot holds. */
const ADRIFT = 2;
const WRECK = 3;

const WHITE: Color = [0.92, 0.92, 0.9];
const STRIPES: readonly Color[] = [
  [1, 0.4, 0.62],
  [0.2, 0.75, 0.85],
  [1, 0.72, 0.4],
  [0.55, 0.45, 0.9],
];
const BUOYS: readonly Color[] = [
  [0.9, 0.22, 0.16],
  [0.95, 0.75, 0.15],
  [0.92, 0.92, 0.9],
];
const DARK: Color = [0.1, 0.12, 0.14];
const SPAR: Color = [0.75, 0.72, 0.66];
const MUD = srgbToLinear(d.vec3f(0.33, 0.28, 0.2));
const MAST_LIGHT: Color = [1, 0.95, 0.85];
const BUOY_LIGHT: Color = [1, 0.62, 0.15];

const turn = (axis: d.v3f, angle: number) => {
  "use gpu";
  return d.vec4f(axis * std.sin(angle / 2), std.cos(angle / 2));
};

const product = (a: d.v4f, b: d.v4f) => {
  "use gpu";
  return d.vec4f(
    a.w * b.xyz + b.w * a.xyz + std.cross(a.xyz, b.xyz),
    a.w * b.w - std.dot(a.xyz, b.xyz),
  );
};

type Part = {
  readonly offset: readonly [number, number, number];
  readonly size: readonly [number, number, number];
  readonly color: Color;
  readonly glow?: Color;
  /** A quarter turn about y makes a box's corner a pointed bow. */
  readonly bow?: boolean;
  readonly blink?: boolean;
};

function partsOf(mooring: Mooring, random: () => number): Part[] {
  if (mooring.kind === BUOY) {
    const color = BUOYS[Math.floor(random() * BUOYS.length)];

    return [
      { offset: [0, 0.55, 0], size: [0.9, 1.1, 0.9], color },
      { offset: [0, 1.15, 0], size: [0.18, 0.5, 0.18], color: DARK },
      {
        offset: [0, 1.45, 0],
        size: [0.26, 0.2, 0.26],
        color: BUOY_LIGHT,
        glow: BUOY_LIGHT,
        blink: true,
      },
    ];
  }

  const stripe = STRIPES[Math.floor(random() * STRIPES.length)];
  if (mooring.kind === MOTORBOAT) {
    return [
      { offset: [0, 0.4, -0.4], size: [2.2, 0.8, 5], color: WHITE },
      { offset: [0, 0.4, 2.1], size: [1.56, 0.8, 1.56], color: WHITE, bow: true },
      { offset: [0, 0.62, -0.4], size: [2.24, 0.16, 5.02], color: stripe },
      { offset: [0, 1.25, -0.6], size: [1.7, 0.9, 2], color: WHITE },
      { offset: [0, 1.3, 0.45], size: [1.6, 0.6, 0.12], color: DARK },
      { offset: [0, 1.95, -0.9], size: [0.18, 0.18, 0.18], color: MAST_LIGHT, glow: MAST_LIGHT },
    ];
  }

  return [
    { offset: [0, 0.35, -0.3], size: [1.9, 0.7, 4.6], color: WHITE },
    { offset: [0, 0.35, 1.9], size: [1.34, 0.7, 1.34], color: WHITE, bow: true },
    { offset: [0, 0.55, -0.3], size: [1.94, 0.12, 4.62], color: stripe },
    { offset: [0, 0.95, -0.6], size: [1.3, 0.5, 1.8], color: WHITE },
    { offset: [0, 4.6, 0.4], size: [0.14, 8, 0.14], color: SPAR },
    { offset: [0, 1.4, -0.7], size: [0.1, 0.1, 2.4], color: SPAR },
    { offset: [0, 8.7, 0.4], size: [0.16, 0.16, 0.16], color: MAST_LIGHT, glow: MAST_LIGHT },
  ];
}

/**
 * The boxes each mooring is drawn as. A part takes its yaw, the swell's roll and pitch, and the
 * list of a wreck from the slot the tick writes.
 */
export function createHull(
  root: TgpuRoot,
  pool: meshPool.MeshPool,
  input: {
    readonly floatsIn: TgpuReadonly<Slots>;
    readonly sea: TgpuUniform<typeof Sea>;
    readonly evening: TgpuUniform<typeof Evening>;
    readonly moorings: readonly Mooring[];
    readonly random: () => number;
  },
) {
  const { floatsIn, sea, evening, moorings, random } = input;

  /** Places a part from its hull: yaw, the swell's roll and pitch, and the list of a wreck. */
  const Part = instances.define("BoatPart", {
    host: {
      body: d.u32,
      offset: d.vec3f,
      size: d.vec3f,
      bow: d.u32,
      glow: d.vec3f,
      blink: d.u32,
    },
    place: (part) => {
      "use gpu";
      const body = floatsIn.$[part.body];
      if (body.mode === 0) {
        return instances.Placement({
          rotation: d.vec4f(0, 0, 0, 1),
          position: d.vec3f(0, -100, 0),
          scale: d.vec3f(0),
        });
      }

      let swell = d.vec2f(
        std.sin(body.age * 1.1 + body.seed * 20),
        std.cos(body.age * 0.9 + body.seed * 13),
      );
      swell = swell * std.select(0.05, 0.16, body.mode === ADRIFT);
      if (body.mode === WRECK) {
        swell = d.vec2f(0);
      }
      const hull = product(
        turn(d.vec3f(0, 1, 0), body.heading),
        product(turn(d.vec3f(1, 0, 0), swell.x), turn(d.vec3f(0, 0, 1), swell.y + body.flip)),
      );
      let own = d.vec4f(0, 0, 0, 1);
      if (part.bow === 1) {
        own = turn(d.vec3f(0, 1, 0), Math.PI / 4);
      }

      return instances.Placement({
        rotation: product(hull, own),
        position: body.position + instances.rotate(hull, part.offset),
        scale: d.vec3f(part.size),
      });
    },
    material: (pixel) => {
      "use gpu";
      const part = pixel.instance;
      const body = floatsIn.$[part.body];
      const dirt = std.saturate(std.select(0, 0.3, body.mode === WRECK) + body.damage * 0.6);
      const look = materials.glossy(std.mix(part.color, MUD, dirt), std.mix(0.3, 0.95, dirt));
      // Buoy lamps flash; mast lights burn steady
      let on = d.f32(1);
      if (part.blink === 1) {
        on = std.step(0.55, std.fract(sea.$.time * 0.5 + body.seed));
      }
      look.emission = part.glow * (evening.$.glow * on * std.select(1, 0, body.mode === WRECK));

      return look;
    },
  });

  const box = pool.add(meshes.box());
  const all = moorings.map((mooring) => partsOf(mooring, random));
  const parts = instances.create(root, pool, {
    kind: Part,
    capacity: Math.max(
      all.reduce((sum, list) => sum + list.length, 0),
      1,
    ),
  });
  all.forEach((list, body) => {
    for (const part of list) {
      parts.add(box, {
        body,
        offset: part.offset,
        size: part.size,
        color: part.color,
        roughness: 0.3,
        bow: part.bow ? 1 : 0,
        glow: part.glow ?? [0, 0, 0],
        blink: part.blink ? 1 : 0,
      });
    }
  });
  parts.flush();

  return {
    renderer: parts.renderer(),

    destroy() {
      parts.destroy();
    },
  };
}
