import {
  cameras,
  environment,
  finish,
  lighting,
  meshPool,
  passes,
  pipelines,
  targets,
  tone,
  type Frame,
  type Surface,
} from "@typegpu/kit";
import { meshes } from "@typegpu/kit/geometry";
import type { TgpuRoot } from "typegpu";

import { createGround } from "@/ground.ts";
import { createStructures } from "@/structures.ts";

const SAMPLES = 4;

/** Środek widoku — forteca po prawej. */
const LOOK_AT: [number, number, number] = [3.2, 0.55, 0];

/**
 * Etap 2: jeden mesh w poolu, dwie tabele `instances` (ziemia + bloki).
 */
export async function createScene(root: TgpuRoot, surface: Surface) {
  const view = cameras.orbit(root, {
    size: surface,
    target: LOOK_AT,
    distance: 17,
    yaw: 0.72,
    pitch: 0.78,
    far: 80,
    pitchRange: [0.35, 1.12],
    distanceRange: [9, 28],
  });
  view.jump();

  const light = lighting.create(root, {
    shadow: { extent: 18, size: 2048 },
    settings: {
      sunDirection: [-0.35, 0.85, -0.4],
      sunIntensity: 2.2,
      sunColor: [1, 0.97, 0.9],
      skyIntensity: 1.1,
    },
  });

  const pool = meshPool.create(root, { capacity: 1, vertices: 24, indices: 36 });
  const brick = pool.add(meshes.box());
  const ground = createGround(root, pool, brick);
  const structures = createStructures(root, pool, brick);

  const HDR = "rgba16float";
  const screen = targets.create(root, surface, {
    color: { format: HDR, samples: SAMPLES },
    depth: { format: "depth24plus", samples: SAMPLES },
    hdr: { format: HDR, sampled: true },
  });

  const scene = passes
    .create(
      root,
      screen,
      { color: passes.color, depth: passes.depth },
      { resolve: { color: "hdr" } },
    )
    .pipe(view.inject())
    .beneath(light.inject());

  const drawn = [
    scene.add(ground.renderer),
    scene.add(structures.renderer),
    scene.add(environment.background(environment.daylight)),
  ];
  const cast = [light.shadow.add(ground.renderer), light.shadow.add(structures.renderer)];

  const final = finish.create(root, {
    format: surface.format,
    source: () => screen.textures.hdr,
    tone: tone.neutral,
  });

  await pipelines.compile([light, scene, final]);

  return {
    view,

    frame(frame: Frame) {
      view.update(frame.dt);
      screen.fit();
      light.shadow.record(frame, cast);
      scene.record(frame, drawn);
      final.record(frame, surface.view(frame));
    },

    destroy() {
      ground.destroy();
      structures.destroy();
      for (const part of [light, pool, screen]) part.destroy();
    },
  };
}
