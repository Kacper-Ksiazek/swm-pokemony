import { randf } from "@typegpu/noise";
import type { TgpuComputePass, TgpuMutable, TgpuRoot, TgpuUniform } from "typegpu";
import { d, std, tgpu } from "typegpu";

import { BUOY } from "@/world/beach";
import { SPAN } from "@/world/layout";

const WORKGROUP = 64;

/** What a slot holds. */
export const MOORED = 1;
const ADRIFT = 2;
const WRECK = 3;

/** A current this fast, or water this far above calm, snaps a mooring rope. */
const SNAP_SPEED = 2.2;
const SNAP_LEVEL = 1.6;
/** The sea breeze, which pushes moored boats gently inshore against their ropes. */
const BREEZE = d.vec2f(0.15, 0.35);
/** How fast a floating hull matches the current, and how stiffly it follows the surface. */
const GRIP = 0.9;
const BUOYANCY = 5;
/** A building or a wall: solid this far above the bare ground stops a hull at any water level. */
const BUILDING = 2.5;
/** Closing speed that does no harm, and damage per metre per second above it. */
const SAFE_HIT = 2;
const HARM = 0.08;

export const Float = d.struct({
  position: d.vec3f,
  mode: d.u32,
  velocity: d.vec3f,
  heading: d.f32,
  anchor: d.vec2f,
  rope: d.f32,
  kind: d.u32,
  spin: d.f32,
  age: d.f32,
  seed: d.f32,
  damage: d.f32,
  /** Roll once it lies aground, in radians. */
  flip: d.f32,
});

export const Sea = d.struct({ dt: d.f32, time: d.f32 });

export const floatSlots = (count: number) => d.arrayOf(Float, count);
export type Slots = ReturnType<typeof floatSlots>;

/** How deep each kind sits in the water, and how far apart two of a kind keep. */
const DRAFTS = tgpu.const(d.arrayOf(d.f32, 3), [0.35, 0.4, 0.55]);
const RADII = tgpu.const(d.arrayOf(d.f32, 3), [2.2, 2, 0.6]);

export type Water = {
  readonly waterAt: (place: d.v2f) => d.v2f;
  readonly currentAt: (place: d.v2f) => d.v2f;
  readonly floorAt: (place: d.v2f) => number;
  readonly groundAt: (place: d.v2f) => number;
};

/**
 * One tick of every hull. Moored, it rides the swell at the end of its rope until a fast current
 * or a surge snaps it. Loose, the flood carries it into walls and other hulls until it runs
 * aground and lies over.
 */
export function createStep(
  root: TgpuRoot,
  input: {
    readonly water: Water;
    readonly count: number;
    readonly floatsOut: TgpuMutable<Slots>;
    readonly sea: TgpuUniform<typeof Sea>;
  },
) {
  const { water, count, floatsOut, sea } = input;
  const { waterAt, currentAt, floorAt, groundAt } = water;

  const blocks = (place: d.v2f, height: number) => {
    "use gpu";
    const floor = floorAt(place);

    return floor > height + 0.8 || floor - groundAt(place) > BUILDING;
  };

  /** The push apart from every other hull touching this one, and the hardest closing speed. */
  const contactsOf = (index: number, body: d.Infer<typeof Float>) => {
    "use gpu";
    let push = d.vec2f(0);
    let hardest = d.f32(0);
    for (let other = d.u32(0); other < count; other++) {
      const them = floatsOut.$[other];
      if (other !== index) {
        const apart = body.position.xz - them.position.xz;
        const distance = std.length(apart);
        const reach = RADII.$[body.kind] + RADII.$[them.kind];
        if (distance < reach && distance > 0.001) {
          const away = apart / distance;
          push += away * (reach - distance);
          hardest = std.max(hardest, std.dot(them.velocity.xz - body.velocity.xz, away));
        }
      }
    }

    return d.vec3f(push, hardest);
  };

  const step = tgpu.computeFn({
    workgroupSize: [WORKGROUP],
    in: { id: d.builtin.globalInvocationId },
  })(({ id }) => {
    "use gpu";
    if (id.x >= count) {
      return;
    }

    const index = id.x;
    const dt = sea.$.dt;
    const body = Float(floatsOut.$[index]);
    if (body.mode === 0) {
      return;
    }

    randf.seed3(d.vec3f(d.f32(index), sea.$.time, body.position.x));
    body.age += dt;
    const place = d.vec2f(body.position.xz);
    const surface = waterAt(place);
    const flow = currentAt(place);
    const draft = DRAFTS.$[body.kind];
    let velocity = d.vec3f(body.velocity);

    if (body.mode === MOORED && (std.length(flow) > SNAP_SPEED || surface.x > SNAP_LEVEL)) {
      body.mode = ADRIFT;
    }
    if (body.mode === WRECK && surface.y > draft + 0.3) {
      body.mode = ADRIFT;
    }

    const afloat = surface.y > draft;
    if (body.mode === MOORED) {
      velocity = d.vec3f(
        std.mix(velocity.x, flow.x + BREEZE.x, std.min(1, dt * GRIP)),
        (surface.x - draft - body.position.y) * BUOYANCY,
        std.mix(velocity.z, flow.y + BREEZE.y, std.min(1, dt * GRIP)),
      );
      // A boat on a rope swings to lie downwind of its anchor, bow toward it
      const from = place - body.anchor;
      if (std.length(from) > 0.2 && body.kind !== BUOY) {
        const target = std.atan2(-from.x, -from.y);
        let delta = target - body.heading;
        delta = delta - std.round(delta / (2 * Math.PI)) * 2 * Math.PI;
        body.heading += delta * std.min(1, dt * 0.8);
      }
    } else if (afloat) {
      // Torn loose: the current carries it and turns it as it goes
      body.mode = ADRIFT;
      velocity = d.vec3f(
        std.mix(velocity.x, flow.x, std.min(1, dt * GRIP)),
        (surface.x - draft - body.position.y) * BUOYANCY,
        std.mix(velocity.z, flow.y, std.min(1, dt * GRIP)),
      );
      body.spin += (randf.sample() - 0.5) * std.length(flow) * dt * 2;
      body.spin *= 1 - dt * 0.4;
    } else {
      // Aground: it scrapes to a halt and lies over on one side
      const keep = std.max(0, 1 - dt * 3);
      velocity = d.vec3f(velocity.x * keep, 0, velocity.z * keep);
      body.spin *= keep;
      if (body.mode === ADRIFT && std.length(velocity.xz) < 0.3) {
        body.mode = WRECK;
        body.flip = std.select(-0.4, 0.4, randf.sample() < 0.5);
      }
    }

    // Walls, buildings and rubble stop a hull and dent it
    let hit = d.f32(0);
    const side = d.vec2f(std.sign(velocity.x), std.sign(velocity.z)) * RADII.$[body.kind] * 0.5;
    if (blocks(place + d.vec2f(velocity.x * dt + side.x, 0), body.position.y)) {
      hit = std.max(hit, std.abs(velocity.x));
      velocity.x = -velocity.x * 0.3;
      body.spin += velocity.z * 0.15;
    }
    if (blocks(place + d.vec2f(0, velocity.z * dt + side.y), body.position.y)) {
      hit = std.max(hit, std.abs(velocity.z));
      velocity.z = -velocity.z * 0.3;
      body.spin -= velocity.x * 0.15;
    }
    const contacts = contactsOf(index, body);
    hit = std.max(hit, contacts.z);
    if (hit > SAFE_HIT) {
      body.damage = std.saturate(body.damage + (hit - SAFE_HIT) * HARM);
    }

    body.position = body.position + d.vec3f(contacts.x, 0, contacts.y) * 0.5 + velocity * dt;

    if (body.mode === MOORED) {
      // The rope holds it within reach of its anchor
      const from = body.position.xz - body.anchor;
      const reach = std.length(from);
      if (reach > body.rope) {
        const held = body.anchor + (from / reach) * body.rope;
        body.position = d.vec3f(held.x, body.position.y, held.y);
        const out = std.dot(velocity.xz, from / reach);
        velocity = velocity - d.vec3f(from.x / reach, 0, from.y / reach) * std.max(out, 0);
      }
    }
    if (floorAt(body.position.xz) - groundAt(body.position.xz) > BUILDING) {
      body.position = d.vec3f(place.x, body.position.y, place.y);
      velocity = d.vec3f(0, velocity.y, 0);
    }
    if (!afloat) {
      body.position.y = std.max(floorAt(body.position.xz), body.position.y - 3 * dt);
    }
    body.velocity = d.vec3f(velocity);
    body.heading += body.spin * dt;

    const edge = SPAN / 2 - 1;
    if (std.abs(body.position.x) > edge || std.abs(body.position.z) > edge) {
      body.mode = 0;
    }
    floatsOut.$[index] = Float(body);
  });
  const stepping = root.createComputePipeline({ compute: step });

  return {
    stepping,

    step(pass: TgpuComputePass) {
      pass.setPipeline(stepping);
      pass.dispatchWorkgroups(Math.ceil(count / WORKGROUP));
    },
  };
}
