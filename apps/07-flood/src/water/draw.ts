import { srgbToLinear } from "@typegpu/color";
import { cameras, environment, materials, passes, shading } from "@typegpu/kit";
import { perlin2d } from "@typegpu/noise";
import type { TgpuReadonly, TgpuUniform } from "typegpu";
import { d, std, tgpu } from "typegpu";

import { EDGE_VERTICES, edgeVertexOf, placeOf } from "@/edges";
import { CELL, CELLS, SPAN } from "@/world/layout";

import { DRY, GRAVITY, indexOf, Look } from "./grid";
import type { Cells } from "./grid";
import type { createPicture } from "./picture";

type Picture = ReturnType<typeof createPicture>;

/** Flood water carries silt: light brown where it is thin, darker where it is deep. */
const SILT = srgbToLinear(d.vec3f(0.56, 0.47, 0.33));
const MURK = srgbToLinear(d.vec3f(0.3, 0.27, 0.19));

/** The clear sea: turquoise over the sand, deep blue farther out. */
const LAGOON = srgbToLinear(d.vec3f(0.2, 0.68, 0.66));
const OCEAN = srgbToLinear(d.vec3f(0.04, 0.26, 0.38));
const FOAM = srgbToLinear(d.vec3f(0.78, 0.76, 0.7));

/** How much one metre of water hides: 0.5 m of water hides about two thirds of the ground. */
const TURBIDITY = 2.2;
/** The clear sea hides the sand far less: about a metre and a half of it hides two thirds. */
const CLARITY = 0.7;

/**
 * Small waves the wind raises: direction along x and z, then wavelength and height in metres.
 * Summed analytically with their exact slopes, which costs a fraction of sampling noise.
 */
const WAVES = [
  [0.94, 0.34, 3.1, 0.16],
  [0.7, 0.71, 2.3, 0.11],
  [0.98, -0.2, 1.7, 0.08],
  [0.5, 0.87, 1.15, 0.05],
  [0.87, -0.5, 0.8, 0.035],
  [0.26, 0.97, 0.6, 0.025],
] as const;

/** Seconds a flow-mapped ripple pattern slides before it restarts. */
const FLOW_PERIOD = 1.6;
/** Fastest current the ripples follow, in metres per second. */
const FLOW_LIMIT = 3;

/**
 * The translucent surface and the silty cut along the map edge. Both sample the picture written
 * once a frame, so they show the same water the simulation just moved.
 */
export function createDraw(input: {
  readonly pictureIn: Picture["pictureIn"];
  readonly currentsIn: Picture["currentsIn"];
  readonly smooth: Picture["smooth"];
  readonly groundIn: TgpuReadonly<Cells>;
  readonly look: TgpuUniform<typeof Look>;
}) {
  const { pictureIn, currentsIn, smooth, groundIn, look } = input;
  const Corner = d.struct({ position: d.vec4f, world: d.vec3f, uv: d.vec2f });
  const Seen = d.struct({ color: d.vec4f });

  /** Two triangles per grid square, built from the vertex index with no vertex buffer. */
  const CORNERS = tgpu.const(d.arrayOf(d.vec2i, 6), [
    d.vec2i(0, 0),
    d.vec2i(1, 0),
    d.vec2i(0, 1),
    d.vec2i(0, 1),
    d.vec2i(1, 0),
    d.vec2i(1, 1),
  ]);
  const squares = CELLS - 1;
  const TEXEL = 1 / CELLS;

  const sampleAt = (uv: d.v2f) => {
    "use gpu";
    return std.textureSampleLevel(pictureIn.$, smooth.$, uv, 0);
  };

  const WAVE_SHAPES = tgpu.const(
    d.arrayOf(d.vec4f, WAVES.length),
    WAVES.map(([x, z, length, height]) => {
      const number = (2 * Math.PI) / length;
      return d.vec4f(x, z, number, height);
    }),
  );
  /** Each wave's speed in radians per second, from deep-water dispersion: sqrt(g * k). */
  const WAVE_SPEEDS = tgpu.const(
    d.arrayOf(d.f32, WAVES.length),
    WAVES.map(([, , length]) => Math.sqrt((GRAVITY * 2 * Math.PI) / length)),
  );

  /**
   * The slope of the wind waves at a point, each wave faded out where a pixel spans more than about
   * a quarter of its wavelength, so distant water never shows a stripe pattern.
   */
  const slopeOf = (place: d.v2f, time: number, footprint: number) => {
    "use gpu";
    let slope = d.vec2f(0);
    for (let i = 0; i < WAVES.length; i++) {
      const wave = WAVE_SHAPES.$[i];
      const fade = std.saturate(1.5 - (footprint * wave.z * 4) / (2 * Math.PI));
      const phase = wave.z * std.dot(wave.xy, place) - WAVE_SPEEDS.$[i] * time;
      slope += wave.xy * (wave.w * wave.z * std.cos(phase) * fade);
    }

    return slope;
  };

  /**
   * Wind waves carried by the current with a flow map: two copies of the pattern slide along the
   * flow, each restarting while the other is fully shown, so the pattern never stretches.
   */
  const carriedSlopeOf = (place: d.v2f, flow: d.v2f, time: number, footprint: number) => {
    "use gpu";
    const first = std.fract(time / FLOW_PERIOD);
    const second = std.fract(time / FLOW_PERIOD + 0.5);
    const a = slopeOf(place - flow * (first * FLOW_PERIOD), time, footprint);
    const b = slopeOf(place - flow * (second * FLOW_PERIOD) + 13, time, footprint);

    return std.mix(a, b, std.abs(first * 2 - 1));
  };

  const drawing = passes.drawing({
    label: "water",
    Vertex: Corner,
    at: (vertexIndex: number) => {
      "use gpu";
      const square = d.i32(vertexIndex / 6);
      const cell = d.vec2i(square % squares, d.i32(square / squares)) + CORNERS.$[vertexIndex % 6];
      const level = std.textureLoad(pictureIn.$, cell, 0).x;
      const world = d.vec3f(
        d.f32(cell.x) * CELL - SPAN / 2,
        level,
        d.f32(cell.y) * CELL - SPAN / 2,
      );
      const uv = (d.vec2f(cell) + 0.5) * TEXEL;

      return Corner({ position: cameras.toClip(world), world, uv });
    },
    pixelOf: (corner) => {
      "use gpu";
      // Pixel footprint in metres, taken before any branch
      const footprint = std.length(std.fwidth(corner.world.xz));
      const here = sampleAt(corner.uv);
      const water = here.y;
      const speed = here.z;
      // Calm water over the seabed is the clear sea; over land or rushing, it is muddy flood
      const bed = here.x - water;
      const clear = std.smoothstep(0.6, -0.8, bed) * (1 - std.smoothstep(1.2, 3.5, speed));
      const body = 1 - std.exp(-water * std.mix(TURBIDITY, CLARITY, clear));

      if (body < 0.004) {
        std.discard();
      }

      // The surface's slope from the smoothed picture, then ripples on top, choppier when fast
      const across = d.vec2f(TEXEL, 0);
      const along = d.vec2f(0, TEXEL);
      const dx = sampleAt(corner.uv + across).x - sampleAt(corner.uv - across).x;
      const dz = sampleAt(corner.uv + along).x - sampleAt(corner.uv - along).x;
      const place = corner.world.xz;
      const time = look.$.time;
      const current = std.textureSampleLevel(currentsIn.$, smooth.$, corner.uv, 0).xy;
      const flow = current * std.min(1, FLOW_LIMIT / std.max(std.length(current), 0.001));
      // One noise sample both breaks up the foam and bends the wave field, so the sum of sines
      // never reads as a regular lattice
      const noise = perlin2d.sample(place * 0.23 + d.vec2f(time * 0.04));
      const warped = place + d.vec2f(noise, -noise) * 2.5;
      const waves = carriedSlopeOf(warped, flow, time, footprint);
      const chop = (0.06 + std.smoothstep(0.5, 6, speed) * 0.3) * std.smoothstep(0.02, 0.4, water);
      const normal = std.normalize(
        d.vec3f(-dx / (2 * CELL) - waves.x * chop, 1, -dz / (2 * CELL) - waves.y * chop),
      );

      // Foam breaks into patches and streaks rather than a flat white sheet
      const breakup = noise * 0.6 + waves.x * 0.25;
      const foam = std.smoothstep(0.35, 0.8, here.w + breakup * 0.5) * 0.85;

      const silt = std.mix(SILT, MURK, std.smoothstep(0.3, 5, water));
      const sea = std.mix(LAGOON, OCEAN, std.smoothstep(0.5, 4, water));
      const tint = std.mix(std.mix(silt, sea, clear), FOAM, foam);
      const surface = materials.glossy(tint, std.mix(0.06, 0.55, foam));
      const point = shading.pointAt(corner.world, normal);
      // Water mirrors the sky at grazing angles: Fresnel with water's 2% reflectance head-on
      const facing = std.saturate(std.dot(point.normal, point.view));
      const mirror = (0.02 + 0.98 * std.pow(1 - facing, 5)) * (1 - foam) * 0.85;
      const sky = environment.reflection(std.reflect(point.view * -1, point.normal), 0.05);
      const lit = std.mix(shading.shade(surface, point), sky, mirror);
      const alpha = std.max(body, foam * std.smoothstep(0.01, 0.08, water));

      return Seen({ color: d.vec4f(lit * alpha, alpha) });
    },
    color: passes.shaded,
    translucent: true,
    primitive: { cullMode: "none" },
    draw: (pass) => pass.draw(squares * squares * 6),
  });

  const Side = d.struct({ position: d.vec4f, world: d.vec3f, normal: d.vec3f, below: d.f32 });

  /** The cut through the water along each side of the map, from the ground up to the surface. */
  const sides = passes.drawing({
    label: "water walls",
    Vertex: Side,
    at: (vertexIndex: number) => {
      "use gpu";
      const edge = edgeVertexOf(vertexIndex);
      const here = std.textureLoad(pictureIn.$, edge.cell, 0);
      const bottom = groundIn.$[indexOf(edge.cell.x, edge.cell.y)];
      // A dry border cell folds its quad flat onto the ground
      const top = std.select(bottom, std.max(here.x, bottom), here.y > DRY);
      const y = std.mix(bottom, top, edge.top);
      const world = d.vec3f(placeOf(edge.cell).x, y, placeOf(edge.cell).y);

      return Side({
        position: cameras.toClip(world),
        world,
        normal: d.vec3f(edge.normal),
        below: top - y,
      });
    },
    pixelOf: (side) => {
      "use gpu";
      // Light fades with depth through silty water; a band of light just under the surface
      const deep = 1 - std.exp(-side.below * 0.6);
      const color = std.mix(SILT, MURK * 0.45, deep);
      const lit = shading.shade(
        materials.glossy(color, 0.1),
        shading.pointAt(side.world, side.normal),
      );
      const alpha = std.mix(0.75, 0.95, deep);

      return Seen({ color: d.vec4f(lit * alpha, alpha) });
    },
    color: passes.shaded,
    translucent: true,
    primitive: { cullMode: "none" },
    draw: (pass) => pass.draw(EDGE_VERTICES),
  });

  return { drawing, sides };
}
