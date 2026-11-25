import * as t3 from "@typegpu/three";
import type { Node } from "three/webgpu";

/**
 * Compiles a TypeGPU `"use gpu"` function into a TSL node for `material.colorNode`.
 *
 * `@typegpu/three` types its result as an untyped TSL `Node`, while `@types/three` 0.187 wants a
 * node tagged with its value type. The shader always returns `d.vec4f`, so the cast is safe.
 */
export function toColorNode(shader: () => unknown) {
  return t3.toTSL(shader) as unknown as Node<"vec4">;
}
