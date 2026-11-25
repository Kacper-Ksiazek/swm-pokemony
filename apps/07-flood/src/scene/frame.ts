import type { Frame } from "@typegpu/kit";

import { createBeachView } from "@/beach";
import { createBoats } from "@/boats";
import { createBuildings } from "@/buildings";
import { createCars } from "@/cars";
import { createDebris } from "@/debris";
import { createFireworks } from "@/fireworks";
import { createGulls } from "@/gulls";
import { createHelicopter } from "@/helicopter";
import { createSigns } from "@/signs";
import { createSpray } from "@/spray";
import { createWalls } from "@/walls";
import { createWater } from "@/water";
import { createWeather } from "@/weather";
import { createDrift } from "@/world/beach";
import { createCollapse } from "@/world/collapse";

import type { DaylightState } from "./daylight";
import { REBAKE } from "./daylight";
import type { Wave } from "./ruins";
import { PACE, seaLevelAt, STEP } from "./tide";

type Water = ReturnType<typeof createWater>;
type Cars = ReturnType<typeof createCars>;
type Boats = ReturnType<typeof createBoats>;
type Debris = ReturnType<typeof createDebris>;
type Spray = ReturnType<typeof createSpray>;
type Fireworks = ReturnType<typeof createFireworks>;
type Weather = ReturnType<typeof createWeather>;
type Gulls = ReturnType<typeof createGulls>;
type Buildings = ReturnType<typeof createBuildings>;
type GpuWalls = ReturnType<typeof createWalls>;
type Shore = ReturnType<typeof createBeachView>;
type Signs = ReturnType<typeof createSigns>;
type Helicopter = ReturnType<typeof createHelicopter>;
type Collapse = ReturnType<typeof createCollapse>;
type Drift = ReturnType<typeof createDrift>;

export function createFrame<Shown, Cast, SkyShader, Swapchain>(parts: {
  direct: (dt: number) => void;
  view: { update(dt: number): void };
  plane: { update(dt: number): void };
  helicopters: readonly Helicopter[];
  RESCUE: readonly { readonly search: readonly [number, number] }[];
  fireworks: Fireworks;
  gulls: Gulls;
  weather: Weather;
  applyLight: (flash: number) => void;
  skyState: DaylightState;
  screen: { fit(): void };
  sky: { bake(frame: Frame, source: SkyShader): void };
  daylight: SkyShader;
  sim: { readonly time: number; readonly ahead: number; update(dt: number): number };
  water: Water;
  wave: Wave;
  topple: (seconds: number) => void;
  collapse: Collapse;
  buildings: Buildings;
  walls: GpuWalls;
  breaches: Collapse;
  shore: Shore;
  signs: Signs;
  spanFalls: Collapse;
  palmFalls: Collapse;
  drift: Drift;
  postFalls: Collapse;
  cars: Cars;
  boats: Boats;
  debris: Debris;
  spray: Spray;
  cast: Cast;
  shown: Shown;
  glow: { record(frame: Frame): void };
  final: { record(frame: Frame, view: Swapchain): void };
  surface: { view(frame: Frame): Swapchain };
  light: { shadow: { record(frame: Frame, cast: Cast): void } };
  scene: { record(frame: Frame, shown: Shown): void };
  camera: { seconds: number };
}) {
  const {
    direct,
    view,
    plane,
    helicopters,
    RESCUE,
    fireworks,
    gulls,
    weather,
    applyLight,
    skyState,
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
  } = parts;
  let baked = false;
  let sea = 0;
  let clearing = false;

  const run = (frame: Frame) => {
    camera.seconds += frame.dt;
    direct(frame.dt);
    view.update(frame.dt);
    plane.update(frame.dt);
    helicopters.forEach((helicopter, i) => helicopter.update(frame.dt, RESCUE[i].search));
    fireworks.update(frame.dt);
    gulls.update(frame.dt);
    const before = weather.level;
    weather.update(frame.dt);
    if (weather.level !== before || weather.flash > 0 || skyState.storm !== weather.level) {
      if (Math.abs(weather.level - skyState.storm) > 0.02 || weather.level !== before)
        skyState.skyChanged = true;
      skyState.storm = weather.level;
      applyLight(weather.flash);
    }
    screen.fit();
    skyState.sinceBake += frame.dt;
    if (!baked || (skyState.skyChanged && skyState.sinceBake >= REBAKE)) {
      sky.bake(frame, daylight);
      baked = true;
      skyState.skyChanged = false;
      skyState.sinceBake = 0;
    }

    const steps = sim.update(frame.dt * PACE);
    const next = wave.flooding
      ? seaLevelAt(sim.time - wave.flooding.since, wave.flooding.crest)
      : 0;
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
  };

  return {
    frame: run,
    get sea() {
      return sea;
    },
    set sea(value: number) {
      sea = value;
    },
    get clearing() {
      return clearing;
    },
    set clearing(value: boolean) {
      clearing = value;
    },
  };
}
