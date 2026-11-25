import { srgbToLinear } from "@typegpu/color";
import { instances, materials, type meshPool } from "@typegpu/kit";
import { meshes } from "@typegpu/kit/geometry";
import type { TgpuReadonly, TgpuRoot } from "typegpu";
import { d, std } from "typegpu";

import { CARS } from "./step";
import type { CarSlots } from "./step";

/** What a car slot holds. */
const EMPTY = 0;
const ADRIFT = 2;
const WRECK = 3;

const PAINTS = [
  [0.75, 0.1, 0.08],
  [0.1, 0.25, 0.6],
  [0.9, 0.9, 0.88],
  [0.12, 0.12, 0.13],
  [0.85, 0.62, 0.1],
  [0.3, 0.45, 0.32],
  [0.55, 0.56, 0.6],
] as const;
const GLASS = srgbToLinear(d.vec3f(0.08, 0.1, 0.12));
/** The silt a flood leaves on everything it carried. */
const MUD = srgbToLinear(d.vec3f(0.33, 0.28, 0.2));

/** A unit quaternion that turns by `angle` radians about a unit axis. */
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

/**
 * Each car drawn as two boxes, a body and a cabin, placed from the car buffer.
 */
export function createMesh(
  root: TgpuRoot,
  pool: meshPool.MeshPool,
  input: { readonly carsIn: TgpuReadonly<CarSlots> },
) {
  const { carsIn } = input;

  /** Places a part of a car from the car's state: yaw, plus a bob and a roll while it floats. */
  const Part = instances.define("CarPart", {
    host: { car: d.u32, offset: d.vec3f, size: d.vec3f },
    // Water leaves silt on every car it carried, and a crushed one more
    material: (pixel) => {
      "use gpu";
      const part = pixel.instance;
      const car = carsIn.$[part.car];
      const carried = std.select(0, 0.35, car.mode === ADRIFT || car.mode === WRECK);
      const dirt = std.saturate(carried + car.damage * 0.6);

      return materials.glossy(std.mix(part.color, MUD, dirt), std.mix(part.roughness, 0.95, dirt));
    },
    place: (part) => {
      "use gpu";
      const car = carsIn.$[part.car];
      if (car.mode === EMPTY) {
        return instances.Placement({
          rotation: d.vec4f(0, 0, 0, 1),
          position: d.vec3f(0, -100, 0),
          scale: d.vec3f(0),
        });
      }

      let tilt = d.vec2f(0);
      if (car.mode === ADRIFT) {
        tilt = d.vec2f(
          std.sin(car.age * 1.7 + car.seed * 20),
          std.cos(car.age * 1.3 + car.seed * 11),
        );
        tilt = tilt * 0.14;
      }
      const yaw = turn(d.vec3f(0, 1, 0), car.heading);
      const pitch = turn(d.vec3f(1, 0, 0), tilt.x);
      const roll = turn(d.vec3f(0, 0, 1), tilt.y + car.flip);
      const rotation = product(yaw, product(pitch, roll));
      // A crushed car sits lower and narrower; a tipped one rests on its side or its roof
      const crush = d.vec3f(1 - car.damage * 0.1, 1 - car.damage * 0.35, 1 - car.damage * 0.08);
      const onSide = std.abs(std.sin(car.flip)) > 0.5;
      const onRoof = std.cos(car.flip) < -0.5;
      const lift = std.select(std.select(0, 1.475, onRoof), 0.9, onSide);

      return instances.Placement({
        rotation,
        position:
          car.position +
          d.vec3f(0, lift * crush.y, 0) +
          instances.rotate(rotation, part.offset * crush),
        scale: part.size * crush,
      });
    },
  });

  const box = pool.add(meshes.box());
  const parts = instances.create(root, pool, {
    kind: Part,
    capacity: CARS * 2,
  });
  for (let car = 0; car < CARS; car++) {
    const paint = PAINTS[car % PAINTS.length];
    parts.add(box, {
      car,
      offset: [0, 0.55, 0],
      size: [1.8, 0.75, 4.2],
      color: [...paint],
      roughness: 0.35,
    });
    parts.add(box, {
      car,
      offset: [0, 1.2, -0.3],
      size: [1.6, 0.55, 2.2],
      color: [GLASS.x, GLASS.y, GLASS.z],
      roughness: 0.15,
    });
  }
  parts.flush();

  return {
    renderer: parts.renderer(),

    destroy() {
      parts.destroy();
    },
  };
}
