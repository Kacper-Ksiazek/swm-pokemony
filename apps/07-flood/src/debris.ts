import { srgbToLinear } from "@typegpu/color";
import { cameras, materials, Particle, particles, shading } from "@typegpu/kit";
import { d, std, type TgpuComputePass, type TgpuRoot } from "typegpu";

import type { Building } from "@/world/layout";

/** Chunks of wall and roof alive at once, and dust puffs. */
const CHUNKS = 6000;
const PUFFS = 1200;
/** Chunks and puffs one fallen building throws, scaled by its size. */
const CHUNKS_PER_CUBIC_METRE = 0.1;
const PUFFS_PER_SQUARE_METRE = 0.35;

const SHARD_GLASS = srgbToLinear(d.vec3f(0.55, 0.65, 0.7));
const SHARD_METAL = srgbToLinear(d.vec3f(0.4, 0.4, 0.42));

/** Dust in daylight, already lit: its colour times the sun and sky it scatters. */
const DUST_LIT = std.mul(srgbToLinear(d.vec3f(0.66, 0.61, 0.54)), 1.8);

type Water = {
  /** Surface height and depth at a point. */
  readonly waterAt: (place: d.v2f) => d.v2f;
  /** Current at a point, along x and z. */
  readonly currentAt: (place: d.v2f) => d.v2f;
  /** Ground or rubble height at a point. */
  readonly floorAt: (place: d.v2f) => number;
};

/**
 * Rubble and dust thrown up by falling buildings. Chunks drop, rest on the ground, or float at
 * the surface and ride the current; dust billows up and slowly settles.
 */
export function createDebris(
  root: TgpuRoot,
  view: cameras.CameraBase,
  water: Water,
  options: { step: number },
) {
  const { waterAt, currentAt, floorAt } = water;

  /** Floats a chunk on the water and carries it along, or lets it lie on the ground. */
  const drift = (chunk: Particle) => {
    "use gpu";
    const next = Particle(chunk);
    const place = chunk.position.xz;
    const surface = waterAt(place);
    const floor = floorAt(place);
    const rest = chunk.size * 0.3;
    if (surface.y > 0.1 && chunk.position.y < surface.x) {
      // Afloat: the current carries it and buoyancy holds it at the surface
      const flow = currentAt(place);
      const lift = (surface.x - rest - chunk.position.y) * 6;
      next.velocity = d.vec3f(flow.x, lift, flow.y);
    } else if (chunk.position.y < floor + rest) {
      next.position = d.vec3f(chunk.position.x, floor + rest, chunk.position.z);
      next.velocity = d.vec3f(chunk.velocity.x * 0.6, 0, chunk.velocity.z * 0.6);
    }
    return next;
  };

  /** A square chip of wall, lit by the scene's sun and sky, that fades out at the end. */
  const chip = (chunk: Particle, local: d.v2f) => {
    "use gpu";
    const left = std.saturate((chunk.life - chunk.age) / 1.5);
    const edge = std.max(std.abs(local.x), std.abs(local.y));
    if (edge > 0.85) {
      return d.vec4f();
    }
    const facing = cameras.towards(cameras.current.$, chunk.position);
    const tone = 0.75 + chunk.seed * 0.5;
    const color = shading.shade(
      materials.matte(chunk.color.xyz * tone),
      shading.pointAt(chunk.position, facing),
    );
    return d.vec4f(color * left, left);
  };

  /** A soft puff of dust: it thins as it spreads and ages. */
  const puff = (dust: Particle, local: d.v2f) => {
    "use gpu";
    const fall = 1 - std.dot(local, local);
    if (fall <= 0) {
      return d.vec4f();
    }
    const age = dust.age / dust.life;
    const alpha = fall * fall * dust.color.w * (1 - age) * std.saturate(age * 8);
    // Dust scatters light every way, so one sunlit colour suits the whole puff: shading each
    // pixel of these large, overlapping quads would cost more than the rest of the debris
    return d.vec4f(DUST_LIT * alpha, alpha);
  };

  /** Dust grows as it spreads. */
  const billow = (dust: Particle, dt: number) => {
    "use gpu";
    const next = Particle(dust);
    next.size = dust.size * (1 + 0.35 * dt);
    return next;
  };

  const chunks = particles.create(root, view, {
    capacity: CHUNKS,
    step: options.step,
    label: "rubble",
    blend: "over",
    update: drift,
    shade: chip,
    settings: { gravity: [0, -9.81, 0], drag: 0.6 },
  });
  const dust = particles.create(root, view, {
    capacity: PUFFS,
    step: options.step,
    label: "dust",
    blend: "over",
    update: billow,
    shade: puff,
    settings: { gravity: [0, 0.4, 0], drag: 1.2 },
  });

  /** Throws one shard of glass or metal from a crash, from any compute kernel. */
  const shatter = (at: d.v3f, velocity: d.v3f, seed: number) => {
    "use gpu";
    chunks.emit(
      Particle({
        position: d.vec3f(at),
        age: 0,
        velocity: d.vec3f(velocity),
        life: 10,
        color: d.vec4f(std.mix(SHARD_GLASS, SHARD_METAL, seed), 1),
        size: 0.18 + seed * 0.2,
        seed,
      }),
    );
  };

  return {
    drawings: [chunks.drawing, dust.drawing],
    shatter,
    initAsync: () => Promise.all([chunks.initAsync(), dust.initAsync()]),

    /** Throws rubble and dust from a building that starts to fall, toward where it falls. */
    collapse(building: Building, toward: readonly [number, number]) {
      const volume = building.width * building.depth * building.height;
      const footprint = building.width * building.depth;
      const middle = building.base + building.height * 0.5;
      chunks.burst({
        count: Math.min(Math.round(volume * CHUNKS_PER_CUBIC_METRE), 600),
        position: [building.x, middle, building.z],
        area: [building.width / 2, building.height / 2, building.depth / 2],
        velocity: [toward[0] * 3, 1, toward[1] * 3],
        scatter: 3,
        color: [...building.color, 1],
        size: 0.7,
        life: 18,
        variance: 0.5,
      });
      dust.burst({
        count: Math.min(Math.round(footprint * PUFFS_PER_SQUARE_METRE), 120),
        position: [building.x, building.base + 2, building.z],
        area: [building.width / 2, 1.5, building.depth / 2],
        velocity: [toward[0] * 1.5, 1.5, toward[1] * 1.5],
        scatter: 2.5,
        color: [1, 1, 1, 0.45],
        size: 4,
        life: 7,
        variance: 0.4,
      });
    },

    /** Spawns this frame's bursts; call once per frame before the steps. */
    spawn(pass: TgpuComputePass) {
      chunks.spawn(pass);
      dust.spawn(pass);
    },

    step(pass: TgpuComputePass) {
      chunks.step(pass);
      dust.step(pass);
    },

    compact(pass: TgpuComputePass, ahead: number) {
      chunks.compact(pass, ahead);
      dust.compact(pass, ahead);
    },

    clear(encoder: Parameters<typeof chunks.clear>[0]) {
      chunks.clear(encoder);
      dust.clear(encoder);
    },

    destroy() {
      chunks.destroy();
      dust.destroy();
    },
  };
}
