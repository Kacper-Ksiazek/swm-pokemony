import {
  bloom,
  cameras,
  clock,
  environment,
  finish,
  lighting,
  meshPool,
  passes,
  pipelines,
  table,
  targets,
  tone,
  type Surface,
} from "@typegpu/kit";
import { tgpu, type TgpuRoot } from "typegpu";

import { createBeachView } from "@/beach";
import { createBuildings } from "@/buildings";
import { createBoats } from "@/boats";
import { createCars } from "@/cars";
import { createDebris } from "@/debris";
import { createFireworks } from "@/fireworks";
import { loadSans } from "@/fonts";
import { createGulls } from "@/gulls";
import { createHelicopter } from "@/helicopter";
import { createPlane } from "@/plane";
import { createSigns } from "@/signs";
import { createSpray } from "@/spray";
import { createTerrain } from "@/terrain";
import { createWalls } from "@/walls";
import { createWater } from "@/water";
import { createWeather } from "@/weather";
import { createBeach } from "@/world/beach";
import { createCollapse, strengthOf } from "@/world/collapse";
import { CELLS, createLayout, groundAt, seeded, SIZE } from "@/world/layout";
import { PANELS, strengthOf as panelStrengthOf, type Point } from "@/world/walls";

import { createCamera } from "./camera";
import { createDaylight } from "./daylight";
import { createFrame } from "./frame";
import { createRuins } from "./ruins";
import { PACE, STEP } from "./tide";
import { createPlayerWalls } from "./walls";

const SAMPLES = 4;
const HDR = "rgba16float";
/**
 * The rescue helicopters: where each waits, where on the flooded seafront it searches, where on
 * its circle it starts and how high it flies, so the three keep apart.
 */
const RESCUE = [
  { hangar: [140, 60, 120], search: [-45, -18], phase: 0, lift: 0 },
  { hangar: [-140, 64, 110], search: [10, -8], phase: 2.1, lift: 6 },
  { hangar: [0, 70, 160], search: [55, -20], phase: 4.2, lift: 12 },
] as const;
/** Lights beyond the lamps: a searchlight each, three firework flashes, lightning. */
const EXTRA_LIGHTS = RESCUE.length + 4;

export async function createScene(root: TgpuRoot, surface: Surface) {
  const layout = createLayout();
  const beach = createBeach(seeded(11));
  /** The lamps on the pier and the promenade, which light their surroundings at night. */
  const lamps = table.create(root, lighting.PointLight, {
    capacity: beach.lamps.length + EXTRA_LIGHTS,
    defaults: { ...lighting.WHITE },
  });

  const view = cameras.orbit(root, {
    size: surface,
    target: [0, 2, 12],
    distance: 215,
    yaw: 0.7,
    pitch: 0.7,
    far: 1000,
    pitchRange: [0.15, 1.45],
    distanceRange: [25, 420],
  });
  const light = lighting.create(root, {
    shadow: { extent: SIZE * 1.15, size: 4096 },
    points: { table: lamps },
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

  const pool = meshPool.create(root, {
    capacity: 12,
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
  const playerWalls = createPlayerWalls({ walls, water, layout, solid });
  const { panels, breaches, rewall, draft, build, markWallAt, removeWall, clearWalls } =
    playerWalls;
  const ray = { origin: [0, 0, 0], direction: [0, 0, 1] };
  const hit = [0, 0, 0];
  const debris = createDebris(root, view, water, { step: STEP });
  const cars = createCars(root, pool, water, debris);
  const shore = createBeachView(root, pool, beach, buildings.evening, lamps);
  const sans = await loadSans(root);
  const plane = createPlane(root, pool, sans);
  const signs = createSigns(root, sans, layout.buildings);
  const helicopters = RESCUE.map((rescue) =>
    createHelicopter(root, pool, lamps, {
      hangar: rescue.hangar,
      phase: rescue.phase,
      lift: rescue.lift,
    }),
  );
  // Fireworks and rain keep real time: their steps run with the flood's, which runs PACE times faster
  const fireworks = createFireworks(root, view, lamps, { step: STEP / PACE, random: seeded(31) });
  const gulls = createGulls(root, pool, seeded(37));
  const spray = createSpray(root, view, water, { step: STEP });
  const weather = createWeather(root, view, lamps, { step: STEP / PACE, random: seeded(41) });
  const boats = createBoats(root, pool, water, beach.moorings, buildings.evening, seeded(5));

  const ruins = createRuins({
    water,
    beach,
    layout,
    solid,
    debris,
    collapse,
    town: playerWalls,
    helicopters,
    fireworks,
  });
  const { wave, spanFalls, palmFalls, postFalls, drift, watchPoints, toppleWith } = ruins;

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
    scene.add(shore.renderer),
    scene.add(boats.renderer),
    scene.add(plane.renderer),
    scene.add(plane.cloth),
    scene.add(plane.letters),
    ...helicopters.map((helicopter) => scene.add(helicopter.renderer)),
    scene.add(gulls.renderer),
    scene.add(signs.drawing),
    // The sky fills only the pixels the opaque drawings left
    scene.add(sky.background()),
    // Translucent, so it blends over everything above in draw order
    scene.add(water.drawing),
    scene.add(water.sides),
    // Light only: the beams add over whatever lies behind them
    scene.add(shore.beams),
    ...helicopters.map((helicopter) => scene.add(helicopter.beam)),
    ...debris.drawings.map((drawing) => scene.add(drawing)),
    scene.add(spray.drawing),
    scene.add(fireworks.drawing),
    scene.add(weather.drawing),
  ];
  const cast = [
    light.shadow.add(terrain.renderer),
    light.shadow.add(buildings.renderer),
    light.shadow.add(walls.renderer),
    light.shadow.add(cars.renderer),
    light.shadow.add(shore.renderer),
    light.shadow.add(boats.renderer),
    light.shadow.add(plane.renderer),
    ...helicopters.map((helicopter) => light.shadow.add(helicopter.renderer)),
  ];
  // Lit windows shine past the screen's white; bloom spreads that light into a soft glow
  const hdr = () => screen.textures.hdr;
  const glow = bloom.create(root, { source: hdr, settings: { threshold: 2.5, knee: 0.8 } });
  const final = finish.create(root, {
    format: surface.format,
    source: hdr,
    glow,
    tone: tone.neutral,
    settings: { glowIntensity: 0.35 },
  });

  await pipelines.compile([
    light,
    sky,
    scene,
    water,
    debris,
    cars,
    boats,
    fireworks,
    spray,
    weather,
    glow,
    final,
  ]);

  const sim = clock.fixedStep({ step: STEP, maxSteps: 4 * PACE });
  const hours = createDaylight({
    light,
    buildings,
    shore,
    signs,
    helicopters,
    fireworks,
    debris,
    spray,
  });
  const topple = toppleWith(sim);
  const camera = createCamera({ view, plane, sim, wave });
  const frames = createFrame({
    direct: camera.direct,
    view,
    plane,
    helicopters,
    RESCUE,
    fireworks,
    gulls,
    weather,
    applyLight: hours.applyLight,
    skyState: hours.state,
    screen,
    sky,
    daylight,
    sim,
    water,
    wave,
    topple,
    collapse,
    buildings,
    walls,
    breaches,
    shore,
    signs,
    spanFalls,
    palmFalls,
    drift,
    postFalls,
    cars,
    boats,
    debris,
    spray,
    cast,
    shown,
    glow,
    final,
    surface,
    light,
    scene,
    camera,
  });

  return {
    view,

    /** The ground point under a pointer at x and y from 0 to 1 across the canvas, if any. */
    groundUnder(x: number, y: number): Point | undefined {
      view.rayAt(x, y, ray);
      if (cameras.hitHeight(ray, groundAt, hit) === undefined) return undefined;

      return [hit[0], hit[2]];
    },

    draft,
    build,
    markWallAt,
    removeWall,
    clearWalls,

    get wallCount() {
      return playerWalls.wallCount;
    },

    /** Moves the sun to an hour of the day, from 0 to 24. */
    setHour: hours.setHour,

    /** Starts the wave: the sea at the edge climbs to `crest` metres above calm water. */
    release(crest: number) {
      wave.flooding = { since: sim.time, crest };
      gulls.startle();
    },

    /** Calls a storm in, or lets it pass. */
    setStorm(on: boolean) {
      weather.setStorm(on);
    },

    /** How the camera moves: as dragged, chasing the wave, or beside the plane. */
    setCinema: camera.setCinema,

    /** Calms the sea and drains the town. */
    reset() {
      wave.flooding = undefined;
      frames.sea = 0;
      water.sim.patch({ sea: frames.sea });
      water.reset(layout);
      solid.set(layout.solid);
      collapse.reset();
      // Broken wall sections are cast again; the walls themselves are the player's to keep
      for (const panel of panels) breaches.place(panel.slot, panelStrengthOf(panel));
      walls.restore();
      rewall();
      buildings.reset();
      cars.reset();
      boats.reset();
      spanFalls.reset();
      palmFalls.reset();
      postFalls.reset();
      drift.reset();
      watchPoints();
      shore.reset();
      signs.reset();
      for (const helicopter of helicopters) helicopter.setActive(false);
      wave.struck = false;
      fireworks.setOn(true);
      frames.clearing = true;
    },

    frame: frames.frame,

    destroy() {
      for (const made of [
        glow,
        light,
        sky,
        terrain,
        buildings,
        cars,
        boats,
        shore,
        plane,
        signs,
        ...helicopters,
        fireworks,
        gulls,
        spray,
        weather,
        debris,
        water,
        pool,
        screen,
      ])
        made.destroy();
    },
  };
}

export type FloodScene = Awaited<ReturnType<typeof createScene>>;
