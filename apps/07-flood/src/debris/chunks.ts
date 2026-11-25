import { srgbToLinear } from "@typegpu/color";
import { cameras, materials, Particle, particles, shading } from "@typegpu/kit";
import { d, std, type TgpuRoot } from "typegpu";

/** Chunks of wall and roof alive at once. */
const CHUNKS = 6000;

const SHARD_GLASS = srgbToLinear(d.vec3f(0.55, 0.65, 0.7));
const SHARD_METAL = srgbToLinear(d.vec3f(0.4, 0.4, 0.42));

export type Water = {
  /** Surface height and depth at a point. */
  readonly waterAt: (place: d.v2f) => d.v2f;
  /** Current at a point, along x and z. */
  readonly currentAt: (place: d.v2f) => d.v2f;
  /** Ground or rubble height at a point. */
  readonly floorAt: (place: d.v2f) => number;
};

/**
 * Solid chips of wall and roof. They drop, rest on the ground, or float at the surface and ride
 * the current.
 */
export function createChunks(
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

  const chunks = particles.create(root, view, {
    capacity: CHUNKS,
    step: options.step,
    label: "rubble",
    blend: "over",
    update: drift,
    shade: chip,
    settings: { gravity: [0, -9.81, 0], drag: 0.6 },
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

  return { chunks, shatter };
}
