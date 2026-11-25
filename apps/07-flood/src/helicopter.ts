import { srgbToLinear } from "@typegpu/color";
import { cameras, instances, lighting, passes, type meshPool, type table } from "@typegpu/kit";
import { meshes } from "@typegpu/kit/geometry";
import { d, std, tgpu, type TgpuRoot } from "typegpu";

import { multiply, rotate, turnAbout, type Piece, type Quaternion, type Vec3 } from "@/world/beach";

/** Where a helicopter waits out of sight by default, and the height it searches from. */
const HANGAR: Vec3 = [140, 60, 120];
const ALTITUDE = 32;

export type HelicopterOptions = {
  /** Where it waits out of sight and returns to. Default far inland, to the north-east. */
  readonly hangar?: Vec3;
  /** Where on its circle it starts, in radians, so several keep apart. Default 0. */
  readonly phase?: number;
  /** Metres above or below the usual search height, so several do not collide. Default 0. */
  readonly lift?: number;
};
/** The circle it flies over the flood: its radius, and how fast it goes round, in radians/s. */
const ORBIT = 34;
const ORBIT_RATE = 0.16;
/** How fast it flies in from the hangar, in metres per second. */
const CRUISE = 30;
/** How far ahead and below it points its searchlight. */
const AIM_AHEAD = 14;
/** The searchlight's pool of light on the ground, and its beam's widths at each end. */
const SPOT_INTENSITY = 26;
const SPOT_RANGE = 11;
const BEAM_START = 0.25;
const BEAM_END = 3.2;
const BEAM_LIGHT = srgbToLinear(d.vec3f(0.85, 0.9, 1));

const RED: Piece["color"] = [0.82, 0.12, 0.1];
const WHITE: Piece["color"] = [0.93, 0.93, 0.9];
const DARK: Piece["color"] = [0.12, 0.13, 0.15];
const GLASS: Piece["color"] = [0.25, 0.35, 0.45];

const part = (
  offset: Vec3,
  size: Vec3,
  color: Piece["color"],
  glow: Piece["color"] = [0, 0, 0],
): Piece => ({
  offset,
  rotation: [0, 0, 0, 1],
  size,
  color,
  glow,
});

/** A rescue helicopter in red and white, nose toward +z. */
const AIRFRAME: Piece[] = [
  part([0, 0, 0], [2.2, 2, 4.6], RED),
  part([0, 0.3, 1.9], [1.9, 1.3, 1.2], GLASS),
  part([0, 0.25, -4.4], [0.5, 0.5, 5], WHITE),
  part([0, 1, -6.7], [0.15, 1.8, 1], RED),
  part([0, -1.25, 0], [0.12, 0.12, 4.4], DARK),
  part([0.9, -1.35, 0], [0.12, 0.12, 4.6], DARK),
  part([-0.9, -1.35, 0], [0.12, 0.12, 4.6], DARK),
  part([0, 1.2, 0], [0.4, 0.5, 0.4], DARK),
  part([0, -0.9, 2.2], [0.5, 0.4, 0.5], WHITE, [3, 3, 3.2]),
];
/** The main rotor's two blades and the tail rotor, turned each frame. */
const MAIN_ROTOR: Piece[] = [
  part([0, 1.5, 0], [10.5, 0.08, 0.35], DARK),
  part([0, 1.5, 0], [0.35, 0.08, 10.5], DARK),
];
const TAIL_ROTOR = part([0.3, 1, -6.7], [0.08, 1.8, 0.25], DARK);

const Beam = d.struct({ origin: d.vec3f, strength: d.f32, end: d.vec3f });

/**
 * A rescue helicopter that comes when the wave is released. It flies in, circles over the flood
 * and sweeps the water with a searchlight: a real light that pools on what it points at, and a
 * beam of light through the air above it.
 */
export function createHelicopter(
  root: TgpuRoot,
  pool: meshPool.MeshPool,
  lamps: table.Table<typeof lighting.PointLight>,
  options: HelicopterOptions = {},
) {
  const hangar = options.hangar ?? HANGAR;
  const altitude = ALTITUDE + (options.lift ?? 0);
  const box = pool.add(meshes.box());
  const all = [...AIRFRAME, ...MAIN_ROTOR, TAIL_ROTOR];
  const parts = instances.create(root, pool, { capacity: all.length });
  const rows = all.map((piece) =>
    parts.add(box, {
      position: hangar,
      // Hidden until it is called out
      scale: [0, 0, 0],
      color: piece.color,
      emission: piece.glow,
      roughness: 0.4,
    }),
  );
  const spot = lamps.add({
    position: hangar,
    color: [0.85, 0.9, 1],
    intensity: 0,
    range: SPOT_RANGE,
  });

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

  /** The searchlight's beam: a strip from the lamp to its target, turned to face the eye. */
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

  let position: Vec3 = hangar;
  let heading = 0;
  let active = false;
  let orbit = options.phase ?? 0;
  let spin = 0;
  let night = 0;

  return {
    renderer: parts.renderer(),
    beam: drawing,

    /** Sends it out over the flood, or home again. */
    setActive(on: boolean) {
      active = on;
    },

    setNight(amount: number) {
      night = amount;
    },

    /** Flies on by `dt` real seconds, circling `centre` on the ground while it is out. */
    update(dt: number, centre: readonly [number, number]) {
      spin += dt * 40;
      orbit += dt * ORBIT_RATE;
      const goal: Vec3 = active
        ? [centre[0] + Math.cos(orbit) * ORBIT, altitude, centre[1] + Math.sin(orbit) * ORBIT]
        : hangar;
      const to: Vec3 = [goal[0] - position[0], goal[1] - position[1], goal[2] - position[2]];
      const distance = Math.hypot(...to);
      const step = Math.min(distance, CRUISE * dt);
      // Back at its base with nothing to do, it is out of sight: draw none of it
      const home = !active && distance - step < 0.5;
      if (distance > 0.01) {
        position = [
          position[0] + (to[0] / distance) * step,
          position[1] + (to[1] / distance) * step,
          position[2] + (to[2] / distance) * step,
        ];
        const wanted = Math.atan2(to[0], to[2]);
        let delta = wanted - heading;
        delta -= Math.round(delta / (2 * Math.PI)) * 2 * Math.PI;
        heading += delta * Math.min(1, dt * 2);
      }
      // It dips its nose when it flies fast and leans into the turn of its circle
      const pitch = Math.min(distance / 40, 1) * 0.18 + 0.06;
      const body: Quaternion = multiply(
        multiply(turnAbout([0, 1, 0], heading), turnAbout([1, 0, 0], pitch)),
        turnAbout([0, 0, 1], active ? -0.12 : 0),
      );
      all.forEach((piece, i) => {
        let own = piece.rotation;
        if (MAIN_ROTOR.includes(piece)) own = turnAbout([0, 1, 0], spin);
        if (piece === TAIL_ROTOR) own = turnAbout([1, 0, 0], spin * 1.5);
        const offset = rotate(body, piece.offset);
        parts.write(rows[i], {
          position: [position[0] + offset[0], position[1] + offset[1], position[2] + offset[2]],
          rotation: multiply(body, own),
          scale: home ? [0, 0, 0] : piece.size,
        });
      });
      parts.flush();

      // The searchlight points ahead and down, at the water or the ground below
      const lamp = rotate(body, [0, -0.9, 2.4]);
      const origin: Vec3 = [position[0] + lamp[0], position[1] + lamp[1], position[2] + lamp[2]];
      const ahead = rotate(turnAbout([0, 1, 0], heading), [0, 0, AIM_AHEAD]);
      const target: Vec3 = [origin[0] + ahead[0], 1, origin[2] + ahead[2]];
      const on = active ? 0.35 + night * 0.65 : 0;
      beam.write({ origin: d.vec3f(...origin), end: d.vec3f(...target), strength: on });
      lamps.write(spot, {
        position: [target[0], target[1] + 4, target[2]],
        intensity: SPOT_INTENSITY * on,
      });
    },

    destroy() {
      parts.destroy();
    },
  };
}
