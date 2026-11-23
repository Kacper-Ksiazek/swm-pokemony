import * as THREE from "three/webgpu";
import * as t3 from "@typegpu/three";
import { d, std } from "typegpu";

import { toColorNode } from "./to-color-node";

/**
 * Shared material for the road mesh. The shader draws a neutral pattern (inlaid ring, soft
 * center, darker sides); the tile kind color comes from the `color` vertex attribute, which three
 * multiplies on top of `colorNode` because `vertexColors` is on.
 *
 * The top face UV runs 0–1 across (u) and along (v) each tile, also on curved tiles.
 */
export function createTileMaterial() {
  const material = new THREE.MeshStandardNodeMaterial({
    roughness: 0.45,
    metalness: 0.05,
    vertexColors: true,
  });

  material.colorNode = toColorNode(() => {
    "use gpu";
    const uv = t3.uv().$;
    const normal = t3.normalLocal.$;

    const top = std.step(0.6, normal.y);
    const centered = std.abs(std.sub(uv, d.vec2f(0.5)));
    const squareDistance = std.max(centered.x, centered.y) * 2;
    const ring =
      std.smoothstep(0.62, 0.68, squareDistance) - std.smoothstep(0.74, 0.8, squareDistance);
    const centerGlow = 1 - std.smoothstep(0.1, 0.5, std.length(std.sub(uv, d.vec2f(0.5))));
    const edgeShade = 1 - std.smoothstep(0.86, 1, squareDistance) * 0.12;

    const topShade = (0.9 + ring * 0.3 + centerGlow * 0.1) * edgeShade;
    const shade = std.mix(0.68, topShade, top);

    return d.vec4f(shade, shade, shade, 1);
  });

  return material;
}
