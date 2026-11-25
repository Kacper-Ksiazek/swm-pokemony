import { createDebris } from "@/debris";
import { createFireworks } from "@/fireworks";
import { createHelicopter } from "@/helicopter";
import { createWater } from "@/water";
import { createDrift, DECK, type Beach } from "@/world/beach";
import { createCollapse, RUBBLE } from "@/world/collapse";
import { CELL, CELLS, seeded, SPAN, type Layout } from "@/world/layout";

import { createPlayerWalls } from "./walls";

/**
 * Kilonewtons a pier span and a palm withstand before they give way. A span is pushed over the
 * water that reaches its deck, a palm over its wet trunk, half rho v squared each.
 */
const SPAN_STRENGTH = 90;
const PALM_STRENGTH = 16;
/** Width of a palm trunk that meets the water, in metres. */
const TRUNK = 0.45;
/** Water this deep at a palm on the beach means the wave has struck the shore. */
const STRUCK_DEPTH = 0.15;

type Water = ReturnType<typeof createWater>;
type Debris = ReturnType<typeof createDebris>;
type Collapse = ReturnType<typeof createCollapse>;
type Fireworks = ReturnType<typeof createFireworks>;
type Helicopter = ReturnType<typeof createHelicopter>;
type PlayerWalls = ReturnType<typeof createPlayerWalls>;

export type Wave = {
  flooding: { since: number; crest: number } | undefined;
  struck: boolean;
};

export function createRuins(parts: {
  water: Water;
  beach: Beach;
  layout: Layout;
  solid: Float32Array;
  debris: Debris;
  collapse: Collapse;
  town: PlayerWalls;
  helicopters: readonly Helicopter[];
  fireworks: Fireworks;
}) {
  const { water, beach, layout, solid, debris, collapse, town, helicopters, fireworks } = parts;
  const { breaches, panels, rewall, rebuild, obstacles } = town;

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
  const wave: Wave = {
    flooding: undefined,
    /** Whether the wave has reached the beach yet, which ends the fireworks. */
    struck: false,
  };

  const toppleWith = (sim: { readonly time: number }) => {
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
      if (wave.flooding && !wave.struck) {
        wave.struck = beach.palms.some((_, i) => sensed[(spanCount + i) * 4 + 1] > STRUCK_DEPTH);
        if (wave.struck) {
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

    return topple;
  };

  return { wave, spanFalls, palmFalls, postFalls, drift, watchPoints, toppleWith };
}
