import { pipelines } from "@typegpu/kit";
import type { Frame } from "@typegpu/kit";
import type { TgpuComputePass, TgpuRoot } from "typegpu";
import { d } from "typegpu";

import type { Layout } from "@/world/layout";

import { createDraw } from "./draw";
import { CELL_COUNT, cells, Look, owners, Sim, vec2Cells, vec4Cells } from "./grid";
import { createPicture } from "./picture";
import { createPush } from "./push";
import { createSamples } from "./sample";
import { createSensors } from "./sensors";
import { createStep } from "./step";

/**
 * Shallow water on the terrain grid with the virtual-pipes method. Every cell keeps its depth
 * and four outflows, one pipe to each neighbour. Each step first speeds up the flow in each
 * pipe by the difference in surface height, then moves water along the pipes. A pipe's cross
 * section is the cell width times the water depth; a fixed section would make every wave crawl
 * at sqrt(g * cell) whatever its depth.
 *
 * A second stage, once a frame, turns the cells into a picture of the water: a smoothed surface,
 * depth, speed and foam that the flow carries along.
 */
export function createWater(
  root: TgpuRoot,
  layout: Layout,
  /** Slots for other structures the water pushes on, numbered after the buildings. */
  options: { readonly walls: number },
) {
  const ground = root.createBuffer(cells, Array.from(layout.ground)).$usage("storage");
  const solid = root.createBuffer(cells, Array.from(layout.solid)).$usage("storage");
  const owner = root.createBuffer(owners, Array.from(layout.owner)).$usage("storage");

  const depth = root.createBuffer(cells).$usage("storage");
  /** Outflow per cell towards -x, +x, -z and +z, in cubic metres per second, kept in two copies. */
  const fluxes = [0, 1].map(() => root.createBuffer(vec4Cells).$usage("storage"));
  const velocity = root.createBuffer(vec2Cells).$usage("storage");
  /** Foam per cell from 0 to 1: last frame's copy, and the one this frame carries it into. */
  const foams = [0, 1].map(() => root.createBuffer(cells).$usage("storage"));

  const sim = root.createUniform(Sim, { dt: 1 / 120, sea: 0 });
  const look = root.createUniform(Look, { dt: 0, time: 0 });

  const groundIn = ground.as("readonly");
  const solidIn = solid.as("readonly");
  const depthIn = depth.as("readonly");
  const depthOut = depth.as("mutable");
  const velocityIn = velocity.as("readonly");
  const velocityOut = velocity.as("mutable");
  const ownerIn = owner.as("readonly");
  const foamBefore = foams[0].as("readonly");
  const foamCarried = foams[1].as("mutable");
  const foamKept = foams[0].as("mutable");
  const foamIn = foams[1].as("readonly");

  const step = createStep(root, {
    fluxRead: [fluxes[0].as("readonly"), fluxes[1].as("readonly")],
    fluxWrite: [fluxes[0].as("mutable"), fluxes[1].as("mutable")],
    depthIn,
    depthOut,
    velocityOut,
    groundIn,
    solidIn,
    sim,
  });
  const picture = createPicture(root, {
    depthIn,
    velocityIn,
    foamBefore,
    foamCarried,
    foamKept,
    foamIn,
    groundIn,
    solidIn,
    look,
  });
  const samples = createSamples({
    pictureIn: picture.pictureIn,
    currentsIn: picture.currentsIn,
    smooth: picture.smooth,
    groundIn,
    solidIn,
    depthIn,
    velocityIn,
  });
  const push = createPush(root, {
    depthIn,
    velocityIn,
    ownerIn,
    buildingCount: layout.buildings.length,
    walls: options.walls,
  });
  const sensors = createSensors(root, samples);
  const drawn = createDraw({
    pictureIn: picture.pictureIn,
    currentsIn: picture.currentsIn,
    smooth: picture.smooth,
    groundIn,
    look,
  });

  const fresh = (values: Layout) => {
    depth.write(Array.from(values.depth));
    for (const flux of fluxes) flux.write(new Array(CELL_COUNT).fill(d.vec4f()));
    for (const foam of foams) foam.write(new Array(CELL_COUNT).fill(0));
    velocity.write(new Array(CELL_COUNT).fill(d.vec2f()));
    step.reset();
  };
  fresh(layout);

  return {
    sim,
    /** Terrain height per cell, which the terrain mesh is baked from. */
    ground,
    drawing: drawn.drawing,
    sides: drawn.sides,
    initAsync: () =>
      pipelines.compile([...step.pipelines, ...picture.pipelines, push.pressing, sensors.sensing]),

    step(pass: TgpuComputePass) {
      step.step(pass);
    },

    /** Records the picture the drawing reads, once a frame after the steps. */
    paint(pass: TgpuComputePass, seconds: number, time: number) {
      look.write({ dt: seconds, time });
      picture.record(pass);
      push.record(pass);
      sensors.record(pass);
    },

    watch: sensors.watch,

    get sensed() {
      return sensors.sensed;
    },

    /** Copies the push on every building toward the CPU, after the pass that painted ends. */
    capture(frame: Frame) {
      push.capture(frame);
      sensors.capture(frame);
    },

    get pushes() {
      return push.pushes;
    },

    /** Replaces which structure stands on each cell, as walls are built, removed or broken. */
    reowner(values: Uint32Array) {
      owner.write(Array.from(values));
    },

    /** Replaces the solid heights above the ground, as when a building falls to a heap. */
    rebuild(values: Float32Array) {
      solid.write(Array.from(values));
    },

    impactAt: samples.impactAt,
    waterAt: samples.waterAt,
    currentAt: samples.currentAt,
    floorAt: samples.floorAt,
    groundAt: samples.groundAt,

    /** Back to the calm sea of the layout. */
    reset(values: Layout) {
      fresh(values);
      solid.write(Array.from(values.solid));
      push.reset();
    },

    destroy() {
      sensors.destroy();
      push.destroy();
      owner.destroy();
      ground.destroy();
      solid.destroy();
      depth.destroy();
      velocity.destroy();
      for (const flux of fluxes) flux.destroy();
      for (const foam of foams) foam.destroy();
      picture.picture.destroy();
      picture.currents.destroy();
    },
  };
}
