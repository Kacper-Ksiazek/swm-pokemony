import { srgbToLinear } from "@typegpu/color";
import { cameras, instances, materials, passes, shading, text, type meshPool } from "@typegpu/kit";
import { meshes } from "@typegpu/kit/geometry";
import { d, std, type TgpuRoot } from "typegpu";

import type { Sans } from "@/fonts";
import { multiply, rotate, turnAbout, type Piece, type Quaternion, type Vec3 } from "@/world/beach";

/** The words the plane tows over the town. */
const MESSAGE = "typegpu kit";

/** The plane circles the town on an ellipse: its centre, its radii and its height, in metres. */
const CENTRE = d.vec2f(0, 8);
const RADII = d.vec2f(115, 88);
const ALTITUDE = 58;
/** Radians of the ellipse flown per second. */
const RATE = 0.075;
/** How far the plane banks into its turn, in radians. */
const BANK = 0.32;

/** The banner, in metres: how far behind the plane it starts, how long and how tall it is. */
const TOW = 9;
const LENGTH = 30;
const HEIGHT = 5;
/** Cloth cells along and down the banner. */
const ALONG = 40;
const DOWN = 4;
/** How high the text stands on the banner, in metres. */
const LETTERS = 3.2;

const CLOTH = srgbToLinear(d.vec3f(0.97, 0.95, 0.9));
const HEM = srgbToLinear(d.vec3f(1, 0.3, 0.6));

const WHITE: readonly [number, number, number] = [0.94, 0.94, 0.92];
const TRIM: readonly [number, number, number] = [0.2, 0.78, 0.86];
const DARK: readonly [number, number, number] = [0.12, 0.13, 0.15];

const piece = (offset: Vec3, size: Vec3, color: Piece["color"]): Piece => ({
  offset,
  rotation: [0, 0, 0, 1],
  size,
  color,
  glow: [0, 0, 0],
});

/** A small high-wing plane, nose toward +z. */
const AIRFRAME: Piece[] = [
  piece([0, 0, 0], [1.3, 1.3, 7], WHITE),
  piece([0, 0.75, 0.6], [11, 0.2, 1.7], WHITE),
  piece([0, 0.75, 0.6], [11.04, 0.22, 0.35], TRIM),
  piece([0, 0.2, -3.2], [3.6, 0.16, 1.1], WHITE),
  piece([0, 0.95, -3.3], [0.16, 1.6, 1.2], TRIM),
  piece([0, 0.35, 1.8], [1.1, 0.6, 1.4], DARK),
  piece([0, 0, 3.7], [0.5, 0.5, 0.5], DARK),
];
/** The propeller, turned about z each frame. */
const PROPELLER = piece([0, 0, 3.95], [0.12, 2.4, 0.12], DARK);

/**
 * A light plane that circles the town towing a banner with the kit's name on it. The banner
 * trails along the flight path and ripples in the wind; the letters are the kit's own text,
 * laid onto the cloth by a placing function so they ripple with it.
 */
export function createPlane(root: TgpuRoot, pool: meshPool.MeshPool, sans: Sans) {
  const Flight = d.struct({ angle: d.f32, time: d.f32 });
  const flight = root.createUniform(Flight, { angle: 0, time: 0 });

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

  const box = pool.add(meshes.box());
  const parts = instances.create(root, pool, { capacity: AIRFRAME.length + 2 });
  const rows = [...AIRFRAME, PROPELLER].map((part) =>
    parts.add(box, { position: [0, -100, 0], scale: part.size, color: part.color, roughness: 0.4 }),
  );
  const towline = parts.add(box, { position: [0, -100, 0], scale: [0.05, 0.05, 1], color: DARK });

  let angle = 0;
  let seconds = 0;

  const pathCpu = (at: number): Vec3 => [
    CENTRE.x + RADII.x * Math.cos(at),
    ALTITUDE + Math.sin(at * 2) * 3,
    CENTRE.y + RADII.y * Math.sin(at),
  ];

  return {
    /** The banner cloth, opaque, and its letters, which blend over it: add them in this order. */
    cloth,
    letters: words.drawing,

    /** Flies the plane on by `dt` seconds of real time. */
    update(dt: number) {
      seconds += dt;
      angle += RATE * dt;
      flight.write({ angle, time: seconds });

      const here = pathCpu(angle);
      const next = pathCpu(angle + 0.01);
      const ahead: Vec3 = [next[0] - here[0], next[1] - here[1], next[2] - here[2]];
      const yaw = Math.atan2(ahead[0], ahead[2]);
      const climb = Math.atan2(ahead[1], Math.hypot(ahead[0], ahead[2]));
      // Flying the ellipse anticlockwise seen from above, it banks to its left, into the turn
      const turn: Quaternion = multiply(
        multiply(turnAbout([0, 1, 0], yaw), turnAbout([1, 0, 0], -climb)),
        turnAbout([0, 0, 1], -BANK),
      );
      [...AIRFRAME, PROPELLER].forEach((part, i) => {
        const spin =
          part === PROPELLER ? turnAbout([0, 0, 1], seconds * 40) : ([0, 0, 0, 1] as const);
        const offset = rotate(turn, part.offset);
        parts.write(rows[i], {
          position: [here[0] + offset[0], here[1] + offset[1], here[2] + offset[2]],
          rotation: multiply(turn, spin),
          scale: part.size,
        });
      });

      // The tow line runs from the tail to the banner's front edge
      const radius = (RADII.x + RADII.y) / 2;
      const tail = rotate(turn, [0, 0, -3.6]);
      const from: Vec3 = [here[0] + tail[0], here[1] + tail[1], here[2] + tail[2]];
      const banner = pathCpu(angle - TOW / radius);
      const to: Vec3 = [banner[0], banner[1] - 1.5 - HEIGHT / 2, banner[2]];
      const line: Vec3 = [to[0] - from[0], to[1] - from[1], to[2] - from[2]];
      const length = Math.hypot(...line);
      const lineYaw = Math.atan2(line[0], line[2]);
      const linePitch = -Math.atan2(line[1], Math.hypot(line[0], line[2]));
      parts.write(towline, {
        position: [(from[0] + to[0]) / 2, (from[1] + to[1]) / 2, (from[2] + to[2]) / 2],
        rotation: multiply(turnAbout([0, 1, 0], lineYaw), turnAbout([1, 0, 0], linePitch)),
        scale: [0.05, 0.05, length],
      });
      parts.flush();
    },

    renderer: parts.renderer(),

    /** Where the plane is now, in world space. */
    get position() {
      return pathCpu(angle);
    },

    destroy() {
      parts.destroy();
      words.destroy();
    },
  };
}
