import * as THREE from "three/webgpu";
import * as t3 from "@typegpu/three";
import { positionWorld, texture } from "three/tsl";
import { d, std } from "typegpu";

import { FIELD_RANGE, ISLAND_RADIUS } from "../scene.constants";
import { fbm, valueNoise } from "./noise";
import { toColorNode } from "./to-color-node";

/**
 * Table top painted in a TypeGPU shader: grassy islands under the roads with sandy beaches, and
 * water with moving ripples everywhere else.
 *
 * `field` is the baked distance-to-road texture (see `terrain-field.ts`). TSL samples it, and
 * `t3.fromTSL` hands that sample to the TypeGPU function as a plain `vec4f`.
 */
export function createTerrainMaterial(field: THREE.Texture, boardSide: number) {
  const material = new THREE.MeshStandardNodeMaterial({ roughness: 0.85, metalness: 0 });
  const fieldUv = positionWorld.xz.div(boardSide).add(0.5);
  const fieldSample = t3.fromTSL(texture(field, fieldUv), d.vec4f);

  material.colorNode = toColorNode(() => {
    "use gpu";
    const world = t3.positionWorld.$;
    const time = t3.time.$;
    const point = d.vec2f(world.x, world.z);

    const largeNoise = fbm(std.mul(point, 0.35));
    const fineNoise = valueNoise(std.mul(point, 3.3));
    const roadDistance = fieldSample.$.x * FIELD_RANGE + (largeNoise - 0.5) * 1.1;

    let grass = std.mix(d.vec3f(0.22, 0.52, 0.14), d.vec3f(0.5, 0.76, 0.22), largeNoise);
    grass = std.mix(grass, d.vec3f(0.64, 0.82, 0.3), fineNoise * 0.2);
    const sand = std.mix(d.vec3f(0.96, 0.84, 0.52), d.vec3f(0.9, 0.76, 0.45), fineNoise);
    const beach = std.smoothstep(ISLAND_RADIUS - 0.4, ISLAND_RADIUS - 0.15, roadDistance);
    const ground = std.mix(grass, sand, beach);

    const depth = std.smoothstep(ISLAND_RADIUS, ISLAND_RADIUS + 2.6, roadDistance);
    const ripple = std.sin(roadDistance * 6 - time * 1.4) * 0.5 + 0.5;
    const foam = (1 - std.smoothstep(ISLAND_RADIUS, ISLAND_RADIUS + 0.35, roadDistance)) * 0.6;
    let water = std.mix(d.vec3f(0.18, 0.74, 0.86), d.vec3f(0.04, 0.33, 0.66), depth);
    water = std.mix(water, d.vec3f(0.72, 0.93, 1), ripple * 0.18 * (1 - depth) + foam);

    const land = 1 - std.smoothstep(ISLAND_RADIUS - 0.05, ISLAND_RADIUS + 0.05, roadDistance);

    return d.vec4f(std.mix(water, ground, land), 1);
  });

  return material;
}
