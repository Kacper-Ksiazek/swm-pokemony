import * as THREE from "three/webgpu";
import * as t3 from "@typegpu/three";
import { d, std } from "typegpu";

import { SPINNER_RADIUS } from "../scene.constants";
import { toColorNode } from "./to-color-node";

/** Number of colored wedges on the spinner wheel (one per possible move, 1–10). */
export const SPINNER_SEGMENTS = 10;

const PI = Math.PI;
const TAU = PI * 2;

/**
 * Spinner wheel face: rainbow wedges split by white spokes, with a white rim. Wedges are computed
 * from the angle around the wheel axis in local space, so rotating the mesh rotates the pattern.
 */
export function createSpinnerMaterial() {
  const material = new THREE.MeshStandardNodeMaterial({ roughness: 0.3, metalness: 0.1 });

  material.colorNode = toColorNode(() => {
    "use gpu";
    const local = t3.positionLocal.$;
    const normal = t3.normalLocal.$;

    const angle = std.atan2(local.z, local.x) + PI;
    const wedge = (angle / TAU) * SPINNER_SEGMENTS;
    const hue = std.floor(wedge) / SPINNER_SEGMENTS;
    const rainbow = std.add(
      d.vec3f(0.5),
      std.mul(0.5, std.cos(std.mul(TAU, std.add(d.vec3f(hue), d.vec3f(0, 0.33, 0.67))))),
    );

    const radius = std.length(d.vec2f(local.x, local.z)) / SPINNER_RADIUS;
    const spokeDistance = std.abs(std.fract(wedge) - 0.5) * 2;
    const spoke = std.smoothstep(0.9, 0.96, spokeDistance);
    const rim = std.smoothstep(0.86, 0.9, radius);
    const hub = 1 - std.smoothstep(0.16, 0.2, radius);
    const white = std.max(std.max(spoke, rim), hub);

    const face = std.mix(rainbow, d.vec3f(0.97), white);
    const top = std.step(0.6, normal.y);

    return d.vec4f(std.mix(d.vec3f(0.92), face, top), 1);
  });

  return material;
}
