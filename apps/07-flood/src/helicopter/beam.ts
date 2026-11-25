import { srgbToLinear } from "@typegpu/color";
import { cameras, passes } from "@typegpu/kit";
import { d, std, tgpu, type TgpuRoot } from "typegpu";

import type { Vec3 } from "@/world/beach";

/** The beam's widths at each end, and the light along it. */
const BEAM_START = 0.25;
const BEAM_END = 3.2;
const BEAM_LIGHT = srgbToLinear(d.vec3f(0.85, 0.9, 1));

const Beam = d.struct({ origin: d.vec3f, strength: d.f32, end: d.vec3f });

/** The searchlight's beam: a strip from the lamp to its target, turned to face the eye. */
export function createBeam(root: TgpuRoot, hangar: Vec3) {
  const beam = root.createUniform(Beam, {
    origin: d.vec3f(...hangar),
    strength: 0,
    end: d.vec3f(...hangar),
  });
  const Corner = d.struct({ position: d.vec4f, across: d.f32, along: d.f32 });
  const Glow = d.struct({ color: d.vec4f });
  const QUAD = tgpu.const(d.arrayOf(d.vec2f, 6), [
    d.vec2f(-1, 0),
    d.vec2f(1, 0),
    d.vec2f(-1, 1),
    d.vec2f(-1, 1),
    d.vec2f(1, 0),
    d.vec2f(1, 1),
  ]);

  const drawing = passes.drawing({
    label: "searchlight",
    Vertex: Corner,
    at: (vertexIndex: number) => {
      "use gpu";
      const corner = QUAD.$[vertexIndex];
      const axis = beam.$.end - beam.$.origin;
      const point = beam.$.origin + axis * corner.y;
      const toEye = std.normalize(cameras.current.$.position - point);
      const side = std.normalize(std.cross(std.normalize(axis), toEye));
      const width = std.mix(BEAM_START, BEAM_END, corner.y);

      return Corner({
        position: cameras.toClip(point + side * (corner.x * width)),
        across: corner.x,
        along: corner.y,
      });
    },
    pixelOf: (corner) => {
      "use gpu";
      const core = 1 - corner.across * corner.across;
      const light = BEAM_LIGHT * (core * core * (1 - corner.along * 0.6) * beam.$.strength * 0.35);

      return Glow({ color: d.vec4f(light, 0) });
    },
    color: passes.shaded,
    translucent: true,
    primitive: { cullMode: "none" },
    draw: (pass) => pass.draw(6),
  });

  return { beam, drawing };
}
