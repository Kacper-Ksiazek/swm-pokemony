import {
  cameras,
  clock,
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
import { tgpu, type TgpuRoot } from "typegpu";

import { createBuildings } from "@/buildings";
import { createCars } from "@/cars";
import { createDebris } from "@/debris";
import { createTerrain } from "@/terrain";
import { createWalls } from "@/walls";
import { createWater } from "@/water";
import { createCollapse, RUBBLE, strengthOf } from "@/world/collapse";
import { CELLS, createLayout, groundAt, SIZE } from "@/world/layout";
import {
  lengthOf,
  makeWall,
  panelCount,
  panelsOf,
  PANELS,
  rasterize,
  SHORTEST,
  snap,
  strengthOf as panelStrengthOf,
  wallNear,
  type Panel,
  type Point,
  type Wall,
} from "@/world/walls";

const SAMPLES = 4;
const HDR = "rgba16float";
/** Simulation step in seconds. Small enough for a wave 10 m deep on 0.6 m cells. */
const STEP = 1 / 120;
/** Simulated seconds per real second, so the wave reaches the town while it is still a wave. */
const PACE = 2;
/**
 * The wave at the sea's edge, in seconds: it climbs to the crest, stays there, then sinks back to
 * calm water. A tsunami is a long wave, so the crest lasts long enough to carry water inland.
 */
const RISE = 2;
const CREST = 4;
const FALL = 6;

const smooth = (t: number) => t * t * (3 - 2 * t);

/** The sea level at the edge after the wave starts: up to the crest, then back to calm water. */
function seaLevelAt(seconds: number, crest: number) {
  if (seconds < RISE) return crest * smooth(seconds / RISE);
  if (seconds < RISE + CREST) return crest;
  return crest * (1 - smooth(Math.min((seconds - RISE - CREST) / FALL, 1)));
}

export async function createScene(root: TgpuRoot, surface: Surface) {
  const layout = createLayout();

  const view = cameras.orbit(root, {
    size: surface,
    target: [0, 2, 8],
    distance: 170,
    yaw: 0.7,
    pitch: 0.7,
    far: 1000,
    pitchRange: [0.15, 1.45],
    distanceRange: [25, 320],
  });
  const light = lighting.create(root, {
    shadow: { extent: SIZE * 1.15, size: 4096 },
    settings: {
      sunDirection: [-0.45, 0.8, -0.4],
      sunIntensity: 2.4,
      sunColor: [1, 0.94, 0.85],
      skyIntensity: 1.2,
      // A brighter sky and warm light bounced off the ground, so faces in shade keep their colour
      skyTop: [0.32, 0.42, 0.58],
      skyBottom: [0.2, 0.18, 0.15],
    },
  });

  // The sky scatters sunlight through the air, which is far too slow to run per pixel. Bake it
  // once into a small cube that the background and the water's reflections sample
  const sky = environment.create(root, { size: 128, samples: 16 });
  const daylight = sky.add(tgpu.fn(environment.daylight).pipe(light.inject()));
  let baked = false;

  const pool = meshPool.create(root, {
    capacity: 6,
    vertices: CELLS * CELLS + 1024,
    indices: (CELLS - 1) * (CELLS - 1) * 6 + 4096,
  });
  const water = createWater(root, layout, { walls: PANELS });
  const terrain = createTerrain(root, pool, water.ground);
  const buildings = createBuildings(root, pool, layout.buildings);
  const collapse = createCollapse(Float32Array.from(layout.buildings, strengthOf));
  /** Solid heights above the ground, lowered to rubble as buildings fall. */
  const solid = Float32Array.from(layout.solid);
  const walls = createWalls(root, pool);
  const standing: Wall[] = [];
  const panels: Panel[] = [];
  /** Section slots not in use, which number each section's push, strain and row. */
  const free = Array.from({ length: PANELS }, (_, i) => PANELS - 1 - i);
  const breaches = createCollapse(new Float32Array(PANELS), layout.buildings.length);
  let nextWall = 1;
  /**
   * How high the walls stand above the ground per cell and which section stands there, then what
   * the water meets: the higher of the buildings and the walls, and their owner.
   */
  const wallHeights = new Float32Array(CELLS * CELLS);
  const wallOwners = new Uint32Array(CELLS * CELLS);
  const obstacles = new Float32Array(CELLS * CELLS);
  const owners = new Uint32Array(CELLS * CELLS);
  const rebuild = () => {
    for (let i = 0; i < obstacles.length; i++) obstacles[i] = Math.max(solid[i], wallHeights[i]);
    water.rebuild(obstacles);
  };
  const rewall = () => {
    rasterize(
      panels,
      (slot) => breaches.falls[slot] !== undefined,
      layout.ground,
      wallHeights,
      wallOwners,
      layout.buildings.length,
    );
    for (let i = 0; i < owners.length; i++) owners[i] = layout.owner[i] || wallOwners[i];
    water.reowner(owners);
    rebuild();
  };
  const unbuild = (wall: Wall) => {
    for (let i = panels.length - 1; i >= 0; i--) {
      if (panels[i].wall !== wall.id) continue;
      const [panel] = panels.splice(i, 1);
      walls.remove(panel.slot);
      breaches.place(panel.slot, 0);
      free.push(panel.slot);
    }
  };
  const ray = { origin: [0, 0, 0], direction: [0, 0, 1] };
  const hit = [0, 0, 0];
  const debris = createDebris(root, view, water, { step: STEP });
  const cars = createCars(root, pool, water, debris);

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
    .pipe(sky.inject())
    .beneath(light.inject());
  const shown = [
    scene.add(terrain.renderer),
    scene.add(terrain.skirt),
    scene.add(buildings.renderer),
    scene.add(walls.renderer),
    scene.add(cars.renderer),
    // The sky fills only the pixels the opaque drawings left
    scene.add(sky.background()),
    // Translucent, so it blends over everything above in draw order
    scene.add(water.drawing),
    scene.add(water.sides),
    ...debris.drawings.map((drawing) => scene.add(drawing)),
  ];
  const cast = [
    light.shadow.add(terrain.renderer),
    light.shadow.add(buildings.renderer),
    light.shadow.add(walls.renderer),
    light.shadow.add(cars.renderer),
  ];
  const final = finish.create(root, {
    format: surface.format,
    source: () => screen.textures.hdr,
    tone: tone.neutral,
  });
  await pipelines.compile([light, sky, scene, water, debris, cars, final]);

  const sim = clock.fixedStep({ step: STEP, maxSteps: 4 * PACE });

  /** Starts the fall of each building the water has overcome and opens its cells to the flow. */
  const topple = (seconds: number) => {
    const pushes = water.pushes;
    if (!pushes || seconds === 0) return;
    const fallen = collapse.update(pushes, sim.time, seconds);
    for (const index of fallen) {
      const building = layout.buildings[index];
      for (const cell of layout.footprints[index]) {
        solid[cell] = Math.max(0, building.base + RUBBLE - layout.ground[cell]);
      }
      debris.collapse(building, collapse.falls[index]!.toward);
    }

    // Wall sections give way on their own, leaving a breach the water pours through
    const breached = breaches.update(pushes, sim.time, seconds);
    for (const slot of breached) {
      const panel = panels.find((candidate) => candidate.slot === slot);
      if (!panel) continue;
      debris.collapse(
        {
          x: (panel.from[0] + panel.to[0]) / 2,
          z: (panel.from[1] + panel.to[1]) / 2,
          base: panel.base,
          width: Math.max(Math.abs(panel.to[0] - panel.from[0]), 1.2),
          depth: Math.max(Math.abs(panel.to[1] - panel.from[1]), 1.2),
          height: panel.top - panel.base,
          color: [0.58, 0.58, 0.56],
        },
        breaches.falls[slot]!.toward,
      );
    }
    if (breached.length > 0) rewall();
    else if (fallen.length > 0) rebuild();
  };
  let flooding: { since: number; crest: number } | undefined;
  let sea = 0;
  let clearing = false;

  return {
    view,

    /** The ground point under a pointer at x and y from 0 to 1 across the canvas, if any. */
    groundUnder(x: number, y: number): Point | undefined {
      view.rayAt(x, y, ray);
      if (cameras.hitHeight(ray, groundAt, hit) === undefined) return undefined;
      return [hit[0], hit[2]];
    },

    /** Shows the wall that a drag from `from` to `to` would build, snapped to the grid. */
    draft(from: Point | undefined, to: Point | undefined, height: number) {
      const a = from && snap(from);
      const b = to && snap(to);
      walls.preview(a && b && lengthOf(a, b) >= SHORTEST ? makeWall(0, a, b, height) : undefined);
    },

    /** Builds a wall between two points; false when it is too short or too many walls stand. */
    build(from: Point, to: Point, height: number) {
      walls.preview(undefined);
      const a = snap(from);
      const b = snap(to);
      if (lengthOf(a, b) < SHORTEST || panelCount(a, b) > free.length) return false;
      const wall = makeWall(nextWall++, a, b, height);
      standing.push(wall);
      const slots = Array.from({ length: panelCount(a, b) }, () => free.pop()!);
      for (const panel of panelsOf(wall, slots)) {
        panels.push(panel);
        walls.add(panel);
        breaches.place(panel.slot, panelStrengthOf(panel));
      }
      rewall();
      return true;
    },

    /** The wall near a ground point, which the pointer would remove, tinted red. */
    markWallAt(point: Point | undefined) {
      const wall = point && wallNear(standing, point);
      walls.mark(wall ? wall.id : undefined);
      return wall?.id;
    },

    removeWall(id: number) {
      const index = standing.findIndex((wall) => wall.id === id);
      if (index < 0) return;
      const [wall] = standing.splice(index, 1);
      unbuild(wall);
      rewall();
    },

    clearWalls() {
      for (const wall of standing) unbuild(wall);
      standing.length = 0;
      rewall();
    },

    get wallCount() {
      return standing.length;
    },

    /** Starts the wave: the sea at the edge climbs to `crest` metres above calm water. */
    release(crest: number) {
      flooding = { since: sim.time, crest };
    },

    /** Calms the sea and drains the town. */
    reset() {
      flooding = undefined;
      sea = 0;
      water.sim.patch({ sea });
      water.reset(layout);
      solid.set(layout.solid);
      collapse.reset();
      // Broken wall sections are cast again; the walls themselves are the player's to keep
      for (const panel of panels) breaches.place(panel.slot, panelStrengthOf(panel));
      walls.restore();
      rewall();
      buildings.reset();
      cars.reset();
      clearing = true;
    },

    frame(frame: Frame) {
      view.update(frame.dt);
      screen.fit();
      if (!baked) sky.bake(frame, daylight);
      baked = true;

      const steps = sim.update(frame.dt * PACE);
      const next = flooding ? seaLevelAt(sim.time - flooding.since, flooding.crest) : 0;
      if (next !== sea) {
        sea = next;
        water.sim.patch({ sea });
      }
      topple(steps * STEP);
      buildings.update(collapse.falls, sim.time);
      walls.update(breaches.falls, sim.time);
      if (clearing) debris.clear(frame);
      clearing = false;

      cars.prepare(STEP, sim.time, true);
      const pass = frame.encoder.beginComputePass();
      debris.spawn(pass);
      for (let i = 0; i < steps; i++) {
        water.step(pass);
        debris.step(pass);
        cars.step(pass);
      }
      water.paint(pass, steps * STEP, sim.time);
      debris.compact(pass, sim.ahead);
      pass.end();
      water.capture(frame);

      light.shadow.record(frame, cast);
      scene.record(frame, shown);
      final.record(frame, surface.view(frame));
    },

    destroy() {
      for (const made of [light, sky, terrain, buildings, cars, debris, water, pool, screen])
        made.destroy();
    },
  };
}

export type FloodScene = Awaited<ReturnType<typeof createScene>>;
