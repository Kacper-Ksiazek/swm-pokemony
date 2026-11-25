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
  type Frame,
  type Surface,
} from "@typegpu/kit";
import { tgpu, type TgpuRoot } from "typegpu";

import { createBuildings } from "@/buildings";
import { createBeachView } from "@/beach";
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
import { createBeach, createDrift, DECK } from "@/world/beach";
import { createCollapse, RUBBLE, strengthOf } from "@/world/collapse";
import { CELL, CELLS, createLayout, groundAt, seeded, SIZE, SPAN } from "@/world/layout";
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
const clamp01 = (t: number) => Math.min(Math.max(t, 0), 1);
const mix = (a: number, b: number, t: number) => a + (b - a) * t;
const mix3 = (a: readonly number[], b: readonly number[], t: number) =>
  [mix(a[0], b[0], t), mix(a[1], b[1], t), mix(a[2], b[2], t)] as [number, number, number];

/** Where the town lies on the globe, in radians: about 52 degrees north, in early summer. */
const LATITUDE = 0.9;
const DECLINATION = 0.3;
/** The hour the town opens at: golden light from a low sun, the first windows lit. */
export const DUSK = 19;
/** The sky's own glow and the light bounced off the ground, by day and by night. */
const DAY_SKY = [0.32, 0.42, 0.58] as const;
const DAY_GROUND = [0.2, 0.18, 0.15] as const;
const NIGHT_SKY = [0.018, 0.028, 0.06] as const;
const NIGHT_GROUND = [0.012, 0.011, 0.01] as const;
/**
 * Kilonewtons a pier span and a palm withstand before they give way. A span is pushed over the
 * water that reaches its deck, a palm over its wet trunk, half rho v squared each.
 */
const SPAN_STRENGTH = 90;
const PALM_STRENGTH = 16;
/** Width of a palm trunk that meets the water, in metres. */
const TRUNK = 0.45;
/** Sunlight at noon, in the lighting's units. */
const SUN = 2.4;
/** Water this deep at a palm on the beach means the wave has struck the shore. */
const STRUCK_DEPTH = 0.15;
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
/** How the camera can move: as the viewer drags it, chasing the wave, or alongside the plane. */
export type Cinema = "free" | "wave" | "plane";
/** Seconds between bakes of the sky while the hour slider moves. */
const REBAKE = 0.08;

/** The sea level at the edge after the wave starts: up to the crest, then back to calm water. */
function seaLevelAt(seconds: number, crest: number) {
  if (seconds < RISE) return crest * smooth(seconds / RISE);
  if (seconds < RISE + CREST) return crest;
  return crest * (1 - smooth(Math.min((seconds - RISE - CREST) / FALL, 1)));
}

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
  let baked = false;

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

  // Sensors under every pier span and at every palm tell the CPU how the water runs there; a
  // palm's sensor follows it once the water carries it off
  const spanCount = beach.spans.length;
  const drift = createDrift(beach.palms, seeded(23));
  const watchPoints = () =>
    water.watch([
      ...beach.spans.map((span) => [span.centre[0], span.centre[2]] as const),
      ...drift.states.map((log) => [log.x, log.z] as const),
      ...beach.posts.map((post) => [post.foot[0], post.foot[2]] as const),
    ]);
  watchPoints();
  /** Where a floating log meets a building or a wall standing taller than it floats. */
  const blocked = (x: number, z: number) => {
    const column = Math.round((x + SPAN / 2) / CELL);
    const row = Math.round((z + SPAN / 2) / CELL);
    if (column < 0 || row < 0 || column >= CELLS || row >= CELLS) return false;
    return obstacles[row * CELLS + column] > 2.5;
  };
  const spanFalls = createCollapse(new Float32Array(spanCount).fill(SPAN_STRENGTH));
  const palmFalls = createCollapse(new Float32Array(beach.palms.length).fill(PALM_STRENGTH));
  const spanPush = new Float32Array(spanCount * 2);
  const palmPush = new Float32Array(beach.palms.length * 2);
  const postFalls = createCollapse(Float32Array.from(beach.posts, (post) => post.strength));
  const postPush = new Float32Array(beach.posts.length * 2);
  const postSensors = spanCount + beach.palms.length;

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

  /**
   * Puts the sun where it stands at an hour of the day and dims the sky after it. Toward night
   * more windows light up and glow brighter, and the sky is baked again for the new light.
   */
  let skyChanged = true;
  let sinceBake = REBAKE;
  let hour = DUSK;
  let storm = 0;
  /**
   * Lights the town for the hour, the storm and the lightning. A storm hides the sun and greys
   * the sky, so windows and lamps come on earlier; a stroke of lightning brightens the sky for a
   * moment. The sky is baked again only when the hour or the storm changes.
   */
  const applyLight = (flash: number) => {
    const sun = environment.sunAt(hour, LATITUDE, DECLINATION);
    const day = smooth(clamp01((sun.y + 0.04) / 0.3));
    // Windows light up from when the sun is low until it has set, and early under storm clouds
    const dusk = Math.max(1 - smooth(clamp01((sun.y + 0.02) / 0.2)), storm * 0.7);
    // The air dims a low sun far more than the sky; expose for it, as an eye adjusts at dusk
    const color = environment.sunColor(sun);
    const brightness = 0.2126 * color.x + 0.7152 * color.y + 0.0722 * color.z;
    const clouds = 1 - storm * 0.55;
    const grey = (c: [number, number, number]) =>
      mix3(
        c,
        [0.12, 0.13, 0.15].map((v) => v * Math.max(day, 0.1)),
        storm * 0.6,
      );
    light.settings.patch({
      sunDirection: sun,
      sunColor: color,
      sunIntensity: (SUN / Math.max(brightness, 0.33)) * (1 - storm * 0.8),
      skyTop: grey(mix3(NIGHT_SKY, DAY_SKY, day)).map((v) => v * clouds) as [
        number,
        number,
        number,
      ],
      skyBottom: mix3(NIGHT_GROUND, DAY_GROUND, day),
      skyIntensity: 1.2 + flash * 5,
    });
    buildings.evening.write({ lit: mix(0.03, 0.6, dusk), glow: mix(0.4, 3.5, dusk) });
    shore.setNight(dusk);
    signs.setNight(dusk);
    for (const helicopter of helicopters) helicopter.setNight(dusk);
    fireworks.setNight(dusk * (1 - storm));
    // Dust and spray only scatter the light around them: dim them with the day and the clouds
    const daylight = Math.max(day * (1 - storm * 0.5), 0.06) + flash * 0.8;
    debris.setDaylight(daylight);
    spray.setDaylight(daylight);
  };
  const setHour = (value: number) => {
    hour = value;
    applyLight(0);
    skyChanged = true;
  };
  setHour(DUSK);

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

    // The pier's spans and the palms feel the water through their sensors
    const sensed = water.sensed;
    if (!sensed) return;
    for (let i = 0; i < spanCount; i++) {
      const [level, , x, z] = sensed.subarray(i * 4, i * 4 + 4);
      // The water that reaches the deck pushes on it, rails and all, half rho v squared
      const wet = Math.min(Math.max(level - (DECK - 0.4), 0), 1.6);
      const force = 0.5 * Math.hypot(x, z) * wet * beach.spans[i].length;
      spanPush[i * 2] = x * force;
      spanPush[i * 2 + 1] = z * force;
    }
    for (const index of spanFalls.update(spanPush, sim.time, seconds)) {
      const span = beach.spans[index];
      debris.collapse(
        {
          x: span.centre[0],
          z: span.centre[2],
          base: DECK - 1,
          width: span.width,
          depth: span.length,
          height: 2,
          color: [0.55, 0.42, 0.3],
        },
        spanFalls.falls[index]!.toward,
        { dust: false },
      );
    }
    beach.palms.forEach((_, i) => {
      const at = (spanCount + i) * 4;
      const [, depth, x, z] = sensed.subarray(at, at + 4);
      // A slender trunk in a flood: half rho v squared over the wet trunk's width
      const force = 0.5 * Math.hypot(x, z) * Math.min(depth, 6) * TRUNK;
      palmPush[i * 2] = x * force;
      palmPush[i * 2 + 1] = z * force;
    });
    palmFalls.update(palmPush, sim.time, seconds);
    beach.posts.forEach((post, i) => {
      const at = (postSensors + i) * 4;
      const [, depth, x, z] = sensed.subarray(at, at + 4);
      // Lamp posts and the arch's legs, half rho v squared over what they show the water
      const force = 0.5 * Math.hypot(x, z) * Math.min(depth, 5) * post.width;
      postPush[i * 2] = x * force;
      postPush[i * 2 + 1] = z * force;
    });
    postFalls.update(postPush, sim.time, seconds);
    // The show ends the moment the wave first reaches the beach, where the palms stand
    if (flooding && !struck) {
      struck = beach.palms.some((_, i) => sensed[(spanCount + i) * 4 + 1] > STRUCK_DEPTH);
      if (struck) {
        fireworks.setOn(false);
        // The rescue is called out only once the wave has struck
        for (const helicopter of helicopters) helicopter.setActive(true);
      }
    }
    beach.palms.forEach((_, i) => {
      const at = (spanCount + i) * 4;
      drift.update(
        i,
        palmFalls.falls[i] !== undefined,
        sensed.subarray(at, at + 4),
        seconds,
        blocked,
      );
    });
    watchPoints();
  };
  let flooding: { since: number; crest: number } | undefined;
  /** Whether the wave has reached the beach yet, which ends the fireworks. */
  let struck = false;
  let sea = 0;
  let clearing = false;
  let cinema: Cinema = "free";
  let seconds = 0;

  /** Points the camera for the cinema modes, which the orbit then eases toward. */
  const direct = (dt: number) => {
    const goal = view.goal;
    if (cinema === "plane") {
      const [x, y, z] = plane.position;
      goal.target = [x, y - 4, z];
      goal.yaw = Math.atan2(x, z - 8) + 0.9;
      goal.distance = 48;
      goal.pitch = 0.18;
    } else if (cinema === "wave") {
      if (flooding) {
        // The front runs inland at about seven metres a second; keep just ahead of it
        const front = Math.min(-62 + (sim.time - flooding.since) * 7, 80);
        goal.target = [Math.sin(seconds * 0.12) * 30, 3, front];
        goal.yaw = 2.6 + Math.sin(seconds * 0.15) * 0.35;
        goal.distance = 80;
        goal.pitch = 0.38;
      } else {
        goal.target = [0, 6, 10];
        goal.yaw += dt * 0.06;
        goal.distance = 190;
        goal.pitch = 0.5;
      }
    }
  };

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

    /** Moves the sun to an hour of the day, from 0 to 24. */
    setHour,

    /** Starts the wave: the sea at the edge climbs to `crest` metres above calm water. */
    release(crest: number) {
      flooding = { since: sim.time, crest };
      gulls.startle();
    },

    /** Calls a storm in, or lets it pass. */
    setStorm(on: boolean) {
      weather.setStorm(on);
    },

    /** How the camera moves: as dragged, chasing the wave, or beside the plane. */
    setCinema(mode: Cinema) {
      cinema = mode;
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
      boats.reset();
      spanFalls.reset();
      palmFalls.reset();
      postFalls.reset();
      drift.reset();
      watchPoints();
      shore.reset();
      signs.reset();
      for (const helicopter of helicopters) helicopter.setActive(false);
      struck = false;
      fireworks.setOn(true);
      clearing = true;
    },

    frame(frame: Frame) {
      seconds += frame.dt;
      direct(frame.dt);
      view.update(frame.dt);
      plane.update(frame.dt);
      helicopters.forEach((helicopter, i) => helicopter.update(frame.dt, RESCUE[i].search));
      fireworks.update(frame.dt);
      gulls.update(frame.dt);
      const before = weather.level;
      weather.update(frame.dt);
      if (weather.level !== before || weather.flash > 0 || storm !== weather.level) {
        if (Math.abs(weather.level - storm) > 0.02 || weather.level !== before) skyChanged = true;
        storm = weather.level;
        applyLight(weather.flash);
      }
      screen.fit();
      sinceBake += frame.dt;
      if (!baked || (skyChanged && sinceBake >= REBAKE)) {
        sky.bake(frame, daylight);
        baked = true;
        skyChanged = false;
        sinceBake = 0;
      }

      const steps = sim.update(frame.dt * PACE);
      const next = flooding ? seaLevelAt(sim.time - flooding.since, flooding.crest) : 0;
      if (next !== sea) {
        sea = next;
        water.sim.patch({ sea });
      }
      topple(steps * STEP);
      buildings.update(collapse.falls, sim.time);
      walls.update(breaches.falls, sim.time);
      shore.update(sim.time, spanFalls.falls, palmFalls.falls, drift.states, postFalls.falls);
      signs.update(collapse.falls);
      if (clearing) {
        debris.clear(frame);
        spray.clear(frame);
      }
      clearing = false;

      cars.prepare(STEP, sim.time, true);
      boats.prepare(STEP, sim.time);
      const pass = frame.encoder.beginComputePass();
      debris.spawn(pass);
      spray.spawn(pass);
      fireworks.spawn(pass);
      weather.spawn(pass);
      for (let i = 0; i < steps; i++) {
        water.step(pass);
        debris.step(pass);
        cars.step(pass);
        boats.step(pass);
        spray.step(pass);
        fireworks.step(pass);
        weather.step(pass);
      }
      water.paint(pass, steps * STEP, sim.time);
      spray.throw(pass, frame.dt);
      debris.compact(pass, sim.ahead);
      spray.compact(pass, sim.ahead);
      fireworks.compact(pass, sim.ahead);
      weather.compact(pass, sim.ahead);
      pass.end();
      water.capture(frame);

      light.shadow.record(frame, cast);
      scene.record(frame, shown);
      glow.record(frame);
      final.record(frame, surface.view(frame));
    },

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
