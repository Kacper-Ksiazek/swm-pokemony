import { srgbToLinear } from "@typegpu/color";
import { cameras, materials, passes, shading, text } from "@typegpu/kit";
import { d, std, type TgpuRoot, type TgpuUniform } from "typegpu";

import type { Sans } from "@/fonts";

import { ALTITUDE, CENTRE, Flight, HEIGHT, LENGTH, RADII, TOW } from "./flight";

/** The words the plane tows over the town. */
const MESSAGE = "typegpu kit";

/** Cloth cells along and down the banner. */
const ALONG = 40;
const DOWN = 4;
/** How high the text stands on the banner, in metres. */
const LETTERS = 3.2;

const CLOTH = srgbToLinear(d.vec3f(0.97, 0.95, 0.9));
const HEM = srgbToLinear(d.vec3f(1, 0.3, 0.6));

export function createBanner(root: TgpuRoot, sans: Sans, flight: TgpuUniform<typeof Flight>) {
  /** A point on the flight path, `angle` radians around the ellipse. */
  const pathAt = (angle: number) => {
    "use gpu";
    return d.vec3f(
      CENTRE.x + RADII.x * std.cos(angle),
      ALTITUDE + std.sin(angle * 2) * 3,
      CENTRE.y + RADII.y * std.sin(angle),
    );
  };

  /**
   * A point on the cloth: `along` from the tow end at 0 to the tail at 1, `down` from the top
   * edge at 0 to the bottom at 1. The cloth follows the path the plane has flown and flaps in a
   * travelling wave that grows toward the free end.
   */
  const clothAt = (along: number, down: number) => {
    "use gpu";
    const radius = (RADII.x + RADII.y) / 2;
    const behind = flight.$.angle - (TOW + along * LENGTH) / radius;
    const top = pathAt(behind) - d.vec3f(0, 1.5, 0);
    const ahead = std.normalize(pathAt(behind + 0.01) - pathAt(behind));
    const side = std.normalize(std.cross(ahead, d.vec3f(0, 1, 0)));
    const flap = std.sin(along * 14 - flight.$.time * 9) * (0.15 + along * 0.6);

    return top - d.vec3f(0, down * HEIGHT, 0) + side * flap;
  };

  const sideOf = (along: number) => {
    "use gpu";
    const radius = (RADII.x + RADII.y) / 2;
    const behind = flight.$.angle - (TOW + along * LENGTH) / radius;
    const ahead = std.normalize(pathAt(behind + 0.01) - pathAt(behind));

    return std.normalize(std.cross(ahead, d.vec3f(0, 1, 0)));
  };

  const Cloth = d.struct({ position: d.vec4f, world: d.vec3f, cell: d.vec2f });
  const Seen = d.struct({ color: d.vec4f });

  /** The banner cloth: a grid of quads built from the vertex index, lit from both sides. */
  const cloth = passes.drawing({
    label: "banner",
    Vertex: Cloth,
    at: (vertexIndex: number) => {
      "use gpu";
      const quad = d.i32(vertexIndex / 6);
      const corner = vertexIndex % 6;
      let step = d.vec2f(0, 0);
      if (corner === 1 || corner === 4) {
        step = d.vec2f(1, 0);
      }
      if (corner === 2 || corner === 3) {
        step = d.vec2f(0, 1);
      }
      if (corner === 5) {
        step = d.vec2f(1, 1);
      }

      const cell =
        (d.vec2f(d.f32(quad % ALONG), d.f32(d.i32(quad / ALONG))) + step) / d.vec2f(ALONG, DOWN);
      const world = clothAt(cell.x, cell.y);

      return Cloth({ position: cameras.toClip(world), world, cell });
    },
    pixelOf: (corner) => {
      "use gpu";
      // A pink hem along the top and bottom edges
      const hem = std.max(std.step(corner.cell.y, 0.07), std.step(0.93, corner.cell.y));
      const side = sideOf(corner.cell.x);
      const toEye = cameras.current.$.position - corner.world;
      const normal = side * std.sign(std.dot(side, toEye));
      const surface = materials.matte(std.mix(CLOTH, HEM, hem));

      return Seen({
        color: d.vec4f(shading.shade(surface, shading.pointAt(corner.world, normal)), 1),
      });
    },
    color: passes.shaded,
    primitive: { cullMode: "none" },
    draw: (pass) => pass.draw(ALONG * DOWN * 6),
  });

  /**
   * Lays each letter onto the cloth: its offset across the label becomes a distance along the
   * banner, and it sits a little off the cloth on one face. The second label is the same words
   * for the other face, mirrored so they read the right way round from there.
   */
  const onCloth = (_position: d.v3f, offset: d.v2f, glyph: text.Placed) => {
    "use gpu";
    const back = glyph.label === 1;
    let across = offset.x;
    if (back) {
      across = -offset.x;
    }
    const along = std.saturate(0.5 + across / LENGTH);
    const down = std.saturate(0.5 - offset.y / HEIGHT);
    const face = std.select(-0.06, 0.06, back);

    return cameras.toClip(clothAt(along, down) + sideOf(along) * face);
  };

  const words = text.create(root, sans, {
    capacity: 2,
    length: MESSAGE.length,
    place: onCloth,
    label: "banner text",
  });
  for (const label of [0, 1]) words.write(label, MESSAGE, { em: LETTERS });
  const ink = [0.05, 0.08, 0.2, 1] as const;
  words.labels.patch({ 0: { color: ink }, 1: { color: ink } });

  return {
    cloth,
    letters: words.drawing,

    destroy() {
      words.destroy();
    },
  };
}
