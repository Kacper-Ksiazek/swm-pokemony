import { srgbToLinear } from "@typegpu/color";
import { cameras, instances, lighting, materials, passes, type table } from "@typegpu/kit";
import { d, std, tgpu, type TgpuRoot, type TgpuUniform } from "typegpu";

import type { Evening } from "@/buildings";
import { BEACON, LAMP_LIGHT, type Beach } from "@/world/beach";

/** How strongly a lamp lights its surroundings at full night, and how far its light reaches. */
const LAMP_INTENSITY = 7;
const LAMP_RANGE = 13;

/** The lighthouse's beams: how far they reach, how wide they open, and how fast they turn. */
const BEAM_LENGTH = 90;
const BEAM_START = 0.7;
const BEAM_END = 11;
const BEAM_TURN = 0.55;
const BEAM_LIGHT = srgbToLinear(d.vec3f(1, 0.9, 0.7));

/** The lighthouse lamp: where it burns, which way its beams point, and how bright they are. */
const Beacon = d.struct({ origin: d.vec3f, angle: d.f32, strength: d.f32 });

/** Pieces of the beach, lit by their own glow once evening comes. */
export function defineLit(evening: TgpuUniform<typeof Evening>) {
  const Lit = instances.define("BeachPiece", {
    host: { glow: d.vec3f },
    material: (pixel) => {
      "use gpu";
      const look = materials.matte(pixel.instance.color);
      look.emission = pixel.instance.glow * evening.$.glow;

      return look;
    },
  });

  return Lit;
}

export type BeachLit = ReturnType<typeof defineLit>;

/**
 * The lamps along the pier and the two beams that sweep from the lighthouse. Point lights live in
 * the scene's lamp table. The beams are a drawing that only adds light.
 */
export function createLights(
  root: TgpuRoot,
  beach: Beach,
  lamps: table.Table<typeof lighting.PointLight>,
) {
  const lampRows = beach.lamps.map((lamp) =>
    lamps.add({ position: lamp.light, color: LAMP_LIGHT, intensity: 0, range: LAMP_RANGE }),
  );
  const dark = new Set<number>();
  let night = 0;

  const beacon = root.createUniform(Beacon, {
    origin: d.vec3f(...BEACON),
    angle: 0,
    strength: 0,
  });
  const BeamCorner = d.struct({ position: d.vec4f, across: d.f32, along: d.f32 });
  const Glow = d.struct({ color: d.vec4f });
  const QUAD = tgpu.const(d.arrayOf(d.vec2f, 6), [
    d.vec2f(-1, 0),
    d.vec2f(1, 0),
    d.vec2f(-1, 1),
    d.vec2f(-1, 1),
    d.vec2f(1, 0),
    d.vec2f(1, 1),
  ]);

  /**
   * Two beams sweeping from the lamp, opposite each other. Each is a strip turned to face the
   * eye along its axis, brightest down the middle and near the lamp, and it only adds light.
   */
  const beams = passes.drawing({
    label: "lighthouse beams",
    Vertex: BeamCorner,
    at: (vertexIndex: number) => {
      "use gpu";
      const corner = QUAD.$[vertexIndex % 6];
      const angle = beacon.$.angle + d.f32(d.i32(vertexIndex / 6)) * Math.PI;
      const axis = std.normalize(d.vec3f(std.cos(angle), -0.04, std.sin(angle)));
      const point = beacon.$.origin + axis * (corner.y * BEAM_LENGTH);
      const toEye = std.normalize(cameras.current.$.position - point);
      const side = std.normalize(std.cross(axis, toEye));
      const width = std.mix(BEAM_START, BEAM_END, corner.y);

      return BeamCorner({
        position: cameras.toClip(point + side * (corner.x * width)),
        across: corner.x,
        along: corner.y,
      });
    },
    pixelOf: (corner) => {
      "use gpu";
      const core = 1 - corner.across * corner.across;
      const fade = std.pow(1 - corner.along, 1.6);
      const light = BEAM_LIGHT * (core * core * fade * beacon.$.strength * 0.5);

      return Glow({ color: d.vec4f(light, 0) });
    },
    color: passes.shaded,
    translucent: true,
    primitive: { cullMode: "none" },
    draw: (pass) => pass.draw(12),
  });

  const sweep = (time: number) => {
    beacon.patch({ angle: time * BEAM_TURN });
  };

  /** Lights the lamps for how dark it is, from 0 by day to 1 at night. */
  const setNight = (amount: number) => {
    night = amount;
    beacon.patch({ strength: amount });
    beach.lamps.forEach((_, i) => {
      lamps.write(lampRows[i], { intensity: dark.has(i) ? 0 : LAMP_INTENSITY * night });
    });
  };

  return {
    beams,
    dark,
    lampRows,
    sweep,
    setNight,
    get night() {
      return night;
    },
  };
}
