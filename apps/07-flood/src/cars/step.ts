import { randf } from "@typegpu/noise";
import type { TgpuComputePass, TgpuMutable, TgpuRoot, TgpuUniform } from "typegpu";
import { d, std, tgpu } from "typegpu";

import { BLOCK, ROADS_ACROSS, ROADS_ALONG, SPAN } from "@/world/layout";

/** Cars the town holds at once. */
export const CARS = 320;
const WORKGROUP = 64;

/** What a car slot holds. */
const EMPTY = 0;
const DRIVING = 1;
const ADRIFT = 2;
const WRECK = 3;

/** Cruising speed in metres per simulated second, and the gap a car keeps behind the next. */
const CRUISE = 7;
const GAP = 14;
const STOP = 6;
/** Distance from the road's centre line to the middle of a lane. */
const LANE = 1;
/** Chance per second that an empty slot sends a new car onto a dry road. */
const SPAWN_RATE = 0.6;
/** Water deeper than this lifts a car off its wheels, in metres. */
const FLOAT_DEPTH = 0.4;
/** How deep a floating car sits in the water, and how fast it matches the current. */
const DRAFT = 0.6;
const GRIP = 1.2;
/**
 * Solid this far above the bare ground is a standing building. It is a wall to a car at any water
 * level, so the flood pins cars against buildings instead of floating them over the roofs.
 */
const BUILDING = 2.5;
/** Anything this far above the road blocks a lane: a flood wall built across it. */
const OBSTACLE = 0.3;
/** How far ahead a driver looks for a wall across the road, in metres. */
const LOOK_AHEAD = 4;

/** Half a car's width, the distance from its middle to its side, in metres. */
const HALF_WIDTH = 1;
/** How stiffly a floating car follows the surface, per second, so it rides down as water drains. */
const BUOYANCY = 6;
/** Fastest a car that lost the water under it settles to the ground, in metres per second. */
const SETTLE = 3;
/** Two cars closer than this touch, centre to centre in metres. */
const REACH = 2.4;
/** Closing speed that does no harm, and damage per metre per second above it. */
const SAFE_HIT = 2.5;
const HARM = 0.07;
/** Closing speed that throws glass and can roll a car onto its side or its roof. */
const HARD_HIT = 6.5;
const SHARDS = 5;

const across = ROADS_ACROSS.length;
const along = ROADS_ALONG.length;

/** One car's state, which only the GPU reads and writes after a reset. */
export const Car = d.struct({
  position: d.vec3f,
  mode: d.u32,
  velocity: d.vec3f,
  heading: d.f32,
  /** The junction a driving car left, as indices into the road lists. */
  node: d.vec2i,
  /** 0 toward +x, 1 toward +z, 2 toward -x, 3 toward -z. */
  direction: d.u32,
  /** Metres driven from the junction. */
  progress: d.f32,
  speed: d.f32,
  /** Yaw rate of a car spinning in the current, in radians per second. */
  spin: d.f32,
  /** Seconds the car has existed, for its bobbing. */
  age: d.f32,
  seed: d.f32,
  /** From 0 for a whole car to 1 for a crushed one. */
  damage: d.f32,
  /** Roll about the car's length once it has been tipped over: 0, a quarter or half a turn. */
  flip: d.f32,
});
export const carSlots = d.arrayOf(Car, CARS);
export type CarSlots = typeof carSlots;

export const Drive = d.struct({ dt: d.f32, time: d.f32, spawning: d.u32 });

const STEPS = tgpu.const(d.arrayOf(d.vec2i, 4), [
  d.vec2i(1, 0),
  d.vec2i(0, 1),
  d.vec2i(-1, 0),
  d.vec2i(0, -1),
]);
const XS = tgpu.const(d.arrayOf(d.f32, across), ROADS_ACROSS);
const ZS = tgpu.const(d.arrayOf(d.f32, along), ROADS_ALONG);

export type Water = {
  readonly waterAt: (place: d.v2f) => d.v2f;
  readonly currentAt: (place: d.v2f) => d.v2f;
  readonly floorAt: (place: d.v2f) => number;
  readonly groundAt: (place: d.v2f) => number;
};

export type Debris = {
  readonly shatter: (at: d.v3f, velocity: d.v3f, seed: number) => void;
};

const junctionAt = (node: d.v2i) => {
  "use gpu";
  return d.vec2f(XS.$[node.x], ZS.$[node.y]);
};

const hasJunction = (node: d.v2i) => {
  "use gpu";
  return node.x >= 0 && node.y >= 0 && node.x < across && node.y < along;
};

/**
 * Steers every car along the lanes, turns them at junctions and keeps them apart, then lets the
 * water lift, spin and carry them once it is deep enough.
 */
export function createStep(
  root: TgpuRoot,
  input: {
    readonly carsOut: TgpuMutable<CarSlots>;
    readonly drive: TgpuUniform<typeof Drive>;
    readonly water: Water;
    readonly debris: Debris;
  },
) {
  const { carsOut, drive, water, debris } = input;
  const { waterAt, currentAt, floorAt, groundAt } = water;
  const { shatter } = debris;

  /** Sends a car onto a random lane of a random road, if that road is dry. */
  const spawn = (index: number) => {
    "use gpu";
    const node = d.vec2i(
      d.i32(randf.sample() * across) % across,
      d.i32(randf.sample() * along) % along,
    );
    const direction = d.u32(randf.sample() * 4) % 4;
    if (!hasJunction(node + STEPS.$[direction])) {
      return;
    }
    const progress = randf.sample() * BLOCK;
    const forward = d.vec2f(STEPS.$[direction]);
    const place = junctionAt(node) + forward * progress + d.vec2f(forward.y, -forward.x) * LANE;
    // Only onto a dry road with nothing built across it
    if (waterAt(place).y > 0.05 || floorAt(place) - groundAt(place) > OBSTACLE) {
      return;
    }
    const car = Car(carsOut.$[index]);
    car.mode = DRIVING;
    car.node = d.vec2i(node);
    car.direction = direction;
    car.progress = progress;
    car.speed = CRUISE * 0.5;
    car.heading = std.atan2(forward.x, forward.y);
    car.position = d.vec3f(place.x, floorAt(place), place.y);
    car.velocity = d.vec3f(0);
    car.spin = 0;
    car.age = 0;
    car.seed = randf.sample();
    car.damage = 0;
    car.flip = 0;
    carsOut.$[index] = Car(car);
  };

  /** Picks the road out of a junction: mostly straight on, sometimes left or right, back if stuck. */
  const nextDirection = (node: d.v2i, direction: number) => {
    "use gpu";
    const roll = randf.sample();
    let first = direction;
    if (roll > 0.5) {
      first = (direction + 1) % 4;
    }
    if (roll > 0.75) {
      first = (direction + 3) % 4;
    }
    for (const offset of tgpu.unroll([0, 1, 2, 3])) {
      const candidate = (first + d.u32(offset)) % 4;
      if (hasJunction(node + STEPS.$[candidate]) && candidate !== (direction + 2) % 4) {
        return candidate;
      }
    }

    return (direction + 2) % 4;
  };

  /** How fast the car may go given the cars ahead of it in its lane. */
  const allowedSpeed = (index: number, position: d.v3f, forward: d.v2f) => {
    "use gpu";
    let allowed = d.f32(CRUISE);
    const right = d.vec2f(forward.y, -forward.x);
    for (let other = d.u32(0); other < CARS; other++) {
      const car = carsOut.$[other];
      if (other !== index && car.mode !== EMPTY) {
        const apart = car.position.xz - position.xz;
        const ahead = std.dot(apart, forward);
        if (ahead > 0 && ahead < GAP && std.abs(std.dot(apart, right)) < 1.4) {
          allowed = std.min(allowed, (CRUISE * std.max(ahead - STOP, 0)) / (GAP - STOP));
        }
      }
    }

    return allowed;
  };

  /**
   * How the other cars touching this one shove it: the push that separates them along x and z,
   * and the fastest closing speed among them. A driving car only notices cars that are not
   * driving, so traffic crossing at a junction never collides.
   */
  const contactsOf = (index: number, position: d.v3f, velocity: d.v3f, driving: boolean) => {
    "use gpu";
    let push = d.vec2f(0);
    let hardest = d.f32(0);
    for (let other = d.u32(0); other < CARS; other++) {
      const car = carsOut.$[other];
      const loose = car.mode === ADRIFT || car.mode === WRECK;
      if (other !== index && car.mode !== EMPTY && (loose || !driving)) {
        const apart = position.xz - car.position.xz;
        const distance = std.length(apart);
        if (distance < REACH && distance > 0.001 && std.abs(car.position.y - position.y) < 2) {
          const away = apart / distance;
          push += away * (REACH - distance);
          const closing = std.dot(car.velocity.xz - velocity.xz, away);
          hardest = std.max(hardest, closing);
        }
      }
    }

    return d.vec3f(push, hardest);
  };

  /** Dents a car by a hit; a hard one throws glass and may roll it over. */
  const strike = (car: d.Infer<typeof Car>, speed: number) => {
    "use gpu";
    const harmed = Car(car);
    if (speed <= SAFE_HIT) {
      return harmed;
    }
    harmed.damage = std.saturate(car.damage + (speed - SAFE_HIT) * HARM);

    if (speed > HARD_HIT) {
      for (let i = 0; i < SHARDS; i++) {
        const fling = d.vec3f(
          randf.sample() - 0.5,
          randf.sample() * 0.8 + 0.4,
          randf.sample() - 0.5,
        );
        shatter(car.position + d.vec3f(0, 1, 0), fling * speed * 0.8, randf.sample());
      }
      if (car.flip === 0 && randf.sample() < 0.3) {
        const side = std.select(-1, 1, randf.sample() < 0.5);
        harmed.flip = std.select(side * Math.PI * 0.5, Math.PI, randf.sample() < 0.35);
      }
    }

    return harmed;
  };

  /** True where a car cannot go: a standing building, or a wall of rubble above the car. */
  const blocks = (place: d.v2f, height: number) => {
    "use gpu";
    const floor = floorAt(place);

    return floor > height + 0.8 || floor - groundAt(place) > BUILDING;
  };

  const step = tgpu.computeFn({
    workgroupSize: [WORKGROUP],
    in: { id: d.builtin.globalInvocationId },
  })(({ id }) => {
    "use gpu";
    if (id.x >= CARS) {
      return;
    }
    const index = id.x;
    const dt = drive.$.dt;
    randf.seed3(d.vec3f(d.f32(index), drive.$.time, carsOut.$[index].position.x));

    if (carsOut.$[index].mode === EMPTY) {
      if (drive.$.spawning === 1 && randf.sample() < SPAWN_RATE * dt) {
        spawn(index);
      }
      return;
    }

    const car = Car(carsOut.$[index]);
    car.age += dt;
    // A copy, not a view of the position: a car pushed into a wall returns here
    const place = d.vec2f(car.position.xz);
    const surface = waterAt(place);

    if (car.mode === DRIVING) {
      let forward = d.vec2f(STEPS.$[car.direction]);
      if (surface.y > FLOAT_DEPTH) {
        // The water lifts the car off its wheels and keeps the speed it had
        car.mode = ADRIFT;
        const heading = d.vec2f(std.sin(car.heading), std.cos(car.heading));
        car.velocity = d.vec3f(heading.x, 0, heading.y) * car.speed;
      } else {
        const moving = d.vec3f(forward.x, 0, forward.y) * car.speed;
        const contacts = contactsOf(index, car.position, moving, true);
        if (contacts.z > SAFE_HIT) {
          // Rammed by a car the water carried: it is knocked off the road and stays a wreck
          const hit = strike(car, contacts.z + car.speed);
          car.damage = hit.damage;
          car.flip = hit.flip;
          car.mode = WRECK;
          car.velocity = moving + d.vec3f(contacts.x, 0, contacts.y) * 3;
        }
      }
      if (car.mode === DRIVING) {
        car.speed = std.mix(
          car.speed,
          allowedSpeed(index, car.position, forward),
          std.min(1, dt * 2),
        );
        car.progress += car.speed * dt;
        // A wall across the road: the driver turns round and heads back the way it came
        const here = junctionAt(car.node) + forward * car.progress;
        const ahead = here + forward * LOOK_AHEAD;
        if (floorAt(ahead) - groundAt(ahead) > OBSTACLE) {
          car.node = car.node + STEPS.$[car.direction];
          car.direction = (car.direction + 2) % 4;
          car.progress = BLOCK - car.progress;
          forward = d.vec2f(STEPS.$[car.direction]);
        }
        if (car.progress >= BLOCK) {
          car.progress -= BLOCK;
          car.node = car.node + STEPS.$[car.direction];
          car.direction = nextDirection(car.node, car.direction);
          forward = d.vec2f(STEPS.$[car.direction]);
        }
        const lane =
          junctionAt(car.node) + forward * car.progress + d.vec2f(forward.y, -forward.x) * LANE;
        car.position = d.vec3f(lane.x, floorAt(lane), lane.y);
        // Ease the heading through the turn rather than snapping it
        const target = std.atan2(forward.x, forward.y);
        let delta = target - car.heading;
        delta = delta - std.round(delta / (2 * Math.PI)) * 2 * Math.PI;
        car.heading += delta * std.min(1, dt * 8);
      }
    }

    if (car.mode === ADRIFT || car.mode === WRECK) {
      const floor = floorAt(place);
      let velocity = d.vec3f(car.velocity);
      const lifted = surface.y > std.select(FLOAT_DEPTH, 0.25, car.mode === ADRIFT);
      let resting = false;
      if (lifted) {
        // Afloat: buoyancy holds it at the surface and the current drags it along, turning it
        car.mode = ADRIFT;
        const flow = currentAt(place);
        const level = surface.x - DRAFT;
        velocity = d.vec3f(
          std.mix(velocity.x, flow.x, std.min(1, dt * GRIP)),
          (level - car.position.y) * BUOYANCY,
          std.mix(velocity.z, flow.y, std.min(1, dt * GRIP)),
        );
        car.spin += (randf.sample() - 0.5) * std.length(flow) * dt * 3;
        car.spin *= 1 - dt * 0.3;
      } else {
        // On land: it settles onto whatever it lies on and scrapes to a halt
        velocity.y = 0;
        resting = car.position.y <= floor + 0.05;
        if (resting) {
          const keep = std.max(0, 1 - dt * 3);
          velocity = d.vec3f(velocity.x * keep, 0, velocity.z * keep);
          car.spin *= keep;
        }
      }

      // Walls and rubble taller than the car stop it, knock it back and dent it
      let hit = d.f32(0);
      // Test where the car's side will be, not its middle, so its body stops at the wall
      const reach = d.vec2f(std.sign(velocity.x), std.sign(velocity.z)) * HALF_WIDTH;
      if (blocks(place + d.vec2f(velocity.x * dt + reach.x, 0), car.position.y)) {
        hit = std.max(hit, std.abs(velocity.x));
        velocity.x = -velocity.x * 0.3;
        car.spin += velocity.z * 0.2;
      }
      if (blocks(place + d.vec2f(0, velocity.z * dt + reach.y), car.position.y)) {
        hit = std.max(hit, std.abs(velocity.z));
        velocity.z = -velocity.z * 0.3;
        car.spin -= velocity.x * 0.2;
      }

      // Cars that touch take the blow, then slide apart by their overlap rather than bounce,
      // which would feed on itself while two cars stay pressed together in the current
      const contacts = contactsOf(index, car.position, velocity, false);
      hit = std.max(hit, contacts.z);
      car.position = car.position + d.vec3f(contacts.x, 0, contacts.y) * 0.5;
      const harmed = strike(car, hit);
      car.damage = harmed.damage;
      car.flip = harmed.flip;

      car.position = car.position + velocity * dt;
      // Whatever pushed it, a car never ends up inside a building: it stays where it was
      if (floorAt(car.position.xz) - groundAt(car.position.xz) > BUILDING) {
        car.position = d.vec3f(place.x, car.position.y, place.y);
        velocity = d.vec3f(0, velocity.y, 0);
      }
      car.velocity = d.vec3f(velocity);
      car.heading += car.spin * dt;
      if (!lifted) {
        const under = floorAt(car.position.xz);
        car.position.y = std.max(under, car.position.y - SETTLE * dt);
      }
      // Left lying still where the water no longer lifts it, even in a puddle: a wreck
      if (!lifted && resting && std.length(velocity.xz) < 0.3) {
        car.mode = WRECK;
      }

      // Carried off the map: the slot frees up for a new car once the roads are dry
      const edge = SPAN / 2 - 1;
      if (std.abs(car.position.x) > edge || std.abs(car.position.z) > edge) {
        car.mode = EMPTY;
      }
    }

    carsOut.$[index] = Car(car);
  });
  const stepping = root.createComputePipeline({ compute: step });

  return {
    pipeline: stepping,

    step(pass: TgpuComputePass) {
      pass.setPipeline(stepping);
      pass.dispatchWorkgroups(Math.ceil(CARS / WORKGROUP));
    },
  };
}
