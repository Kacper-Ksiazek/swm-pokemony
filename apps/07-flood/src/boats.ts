import { srgbToLinear } from "@typegpu/color";
import { instances, materials, pipelines, type meshPool } from "@typegpu/kit";
import { meshes } from "@typegpu/kit/geometry";
import { randf } from "@typegpu/noise";
import { d, std, tgpu, type TgpuComputePass, type TgpuRoot, type TgpuUniform } from "typegpu";

import type { Evening } from "@/buildings";
import { BUOY, MOTORBOAT, type Mooring } from "@/world/beach";
import type { Color } from "@/world/layout";
import { SPAN } from "@/world/layout";

const WORKGROUP = 64;

/** What a slot holds. */
const MOORED = 1;
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

const Float = d.struct({
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

const Sea = d.struct({ dt: d.f32, time: d.f32 });

/** How deep each kind sits in the water, and how far apart two of a kind keep. */
const DRAFTS = tgpu.const(d.arrayOf(d.f32, 3), [0.35, 0.4, 0.55]);
const RADII = tgpu.const(d.arrayOf(d.f32, 3), [2.2, 2, 0.6]);

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

type Water = {
  readonly waterAt: (place: d.v2f) => d.v2f;
  readonly currentAt: (place: d.v2f) => d.v2f;
  readonly floorAt: (place: d.v2f) => number;
  readonly groundAt: (place: d.v2f) => number;
};

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
 * Boats and buoys on the GPU. Moored, they ride the swell at the end of their ropes and turn to
 * the breeze; a fast current or a surge snaps the rope, and the flood carries them like the cars,
 * into walls and each other, until they run aground and lie over on their sides.
 */
export function createBoats(
  root: TgpuRoot,
  pool: meshPool.MeshPool,
  water: Water,
  moorings: readonly Mooring[],
  evening: TgpuUniform<typeof Evening>,
  random: () => number,
) {
  const { waterAt, currentAt, floorAt, groundAt } = water;
  const count = Math.max(moorings.length, 1);
  const floats = root.createBuffer(d.arrayOf(Float, count)).$usage("storage");
  const floatsOut = floats.as("mutable");
  /** Only the drawing reads this view: a kernel may not bind one buffer both ways at once. */
  const floatsIn = floats.as("readonly");
  const sea = root.createUniform(Sea, { dt: 0, time: 0 });

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

  const moored = () =>
    moorings.map((mooring, i) =>
      Float({
        position: d.vec3f(mooring.anchor[0], 0, mooring.anchor[1]),
        mode: MOORED,
        velocity: d.vec3f(0),
        heading: mooring.heading,
        anchor: d.vec2f(...mooring.anchor),
        rope: mooring.rope,
        kind: mooring.kind,
        spin: 0,
        age: 0,
        seed: (i * 0.618) % 1,
        damage: 0,
        flip: 0,
      }),
    );
  floats.write(moored());

  return {
    renderer: parts.renderer(),
    initAsync: () => pipelines.compile([stepping]),

    /** Sets the step length and the clock, once a frame before the steps. */
    prepare(dt: number, time: number) {
      sea.write({ dt, time });
    },

    step(pass: TgpuComputePass) {
      pass.setPipeline(stepping);
      pass.dispatchWorkgroups(Math.ceil(count / WORKGROUP));
    },

    /** Every boat and buoy back on its mooring. */
    reset() {
      floats.write(moored());
    },

    destroy() {
      parts.destroy();
      floats.destroy();
    },
  };
}
