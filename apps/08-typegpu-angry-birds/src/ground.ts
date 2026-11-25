import { instances, type meshPool } from "@typegpu/kit";
import { srgbToLinear } from "@typegpu/color";
import { d, type TgpuRoot } from "typegpu";

/** Płaska plansza — cienki box w scenie 3D. */
const GRASS = srgbToLinear(d.vec3f(0.38, 0.68, 0.34));

export function createGround(root: TgpuRoot, pool: meshPool.MeshPool, slab: meshPool.Mesh) {
  const field = instances.create(root, pool, { capacity: 1 });

  field.add(slab, {
    position: [0, -0.05, 0],
    rotation: [0, 0, 0, 1],
    scale: [14, 0.12, 7],
    color: [GRASS.x, GRASS.y, GRASS.z],
    roughness: 0.92,
  });
  field.flush();

  return {
    renderer: field.renderer(),
    destroy() {
      field.destroy();
    },
  };
}
