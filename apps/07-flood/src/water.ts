import { srgbToLinear } from "@typegpu/color";
import {
  cameras,
  environment,
  materials,
  passes,
  pipelines,
  readback,
  shading,
} from "@typegpu/kit";
import { perlin2d } from "@typegpu/noise";
import type { Frame } from "@typegpu/kit";
import { d, std, tgpu, type TgpuComputePass, type TgpuRoot } from "typegpu";

import { EDGE_VERTICES, edgeVertexOf, placeOf } from "@/edges";
import { CELL, CELLS, SPAN, type Layout } from "@/world/layout";

const GRAVITY = 9.81;
/** Share of each pipe's flow kept from the step before: about 5% lost per simulated second. */
const KEEP = 0.9998;
/**
 * How far each pipe's flow moves toward the same pipe in the neighbouring cells per step. This
 * eddy viscosity smooths the grid-sized crinkles fast water raises in narrow streets.
 */
const VISCOSITY = 0.04;
/** Manning roughness of streets and lawns, which slows thin, fast water the most. */
const ROUGHNESS = 0.035;
/** Rows along the sea edge whose surface follows the sea level. */
const SOURCE_ROWS = 3;
/** Depth below which a cell counts as dry, in metres. */
const DRY = 0.01;
/** Fastest water the simulation allows, in metres per second. */
const TOP_SPEED = 16;
/** Seconds for foam to fade to a third. */
const FOAM_LIFE = 1.6;
const WORKGROUP = 8;
/** Fixed-point units per kilonewton, since atomics add only integers. */
const PUSH_UNITS = 64;
/** Water density in tonnes per cubic metre, so pressures come out in kilopascals. */
const DENSITY = 1;
/** How many times a second the CPU learns the push on every building. */
const PUSH_RATE = 8;

/** Flood water carries silt: light brown where it is thin, darker where it is deep. */
const SILT = srgbToLinear(d.vec3f(0.56, 0.47, 0.33));
const MURK = srgbToLinear(d.vec3f(0.3, 0.27, 0.19));
const FOAM = srgbToLinear(d.vec3f(0.78, 0.76, 0.7));
/** How much one metre of water hides: 0.5 m of water hides about two thirds of the ground. */
const TURBIDITY = 2.2;
/**
 * Small waves the wind raises: direction along x and z, then wavelength and height in metres.
 * Summed analytically with their exact slopes, which costs a fraction of sampling noise.
 */
const WAVES = [
  [0.94, 0.34, 3.1, 0.16],
  [0.7, 0.71, 2.3, 0.11],
  [0.98, -0.2, 1.7, 0.08],
  [0.5, 0.87, 1.15, 0.05],
  [0.87, -0.5, 0.8, 0.035],
  [0.26, 0.97, 0.6, 0.025],
] as const;
/** Seconds a flow-mapped ripple pattern slides before it restarts. */
const FLOW_PERIOD = 1.6;
/** Fastest current the ripples follow, in metres per second. */
const FLOW_LIMIT = 3;

/** Values the CPU writes when they change: the step length and the sea level at the edge. */
export const Sim = d.struct({ dt: d.f32, sea: d.f32 });
/** Values written once a frame: simulated seconds this frame and in total. */
const Look = d.struct({ dt: d.f32, time: d.f32 });

const indexOf = (column: number, row: number) => {
  "use gpu";
  return d.u32(row) * CELLS + d.u32(column);
};

const inside = (column: number, row: number) => {
  "use gpu";
  return column >= 0 && row >= 0 && column < CELLS && row < CELLS;
};

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
  const count = CELLS * CELLS;
  const cells = d.arrayOf(d.f32, count);
  const ground = root.createBuffer(cells, Array.from(layout.ground)).$usage("storage");
  const solid = root.createBuffer(cells, Array.from(layout.solid)).$usage("storage");
  const owner = root
    .createBuffer(d.arrayOf(d.u32, count), Array.from(layout.owner))
    .$usage("storage");
  const depth = root.createBuffer(cells).$usage("storage");
  /** Outflow per cell towards -x, +x, -z and +z, in cubic metres per second, kept in two copies. */
  const fluxes = [0, 1].map(() => root.createBuffer(d.arrayOf(d.vec4f, count)).$usage("storage"));
  const velocity = root.createBuffer(d.arrayOf(d.vec2f, count)).$usage("storage");
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
  const foamBefore = foams[0].as("readonly");
  const foamCarried = foams[1].as("mutable");
  const foamKept = foams[0].as("mutable");
  const foamIn = foams[1].as("readonly");

  const floorOf = (index: number) => {
    "use gpu";
    return groundIn.$[index] + solidIn.$[index];
  };

  // ---- Simulation --------------------------------------------------------------------------

  /**
   * Speeds up each pipe by the surface drop towards its neighbour, spreads it toward the same
   * pipe next door, slows it on the ground, then caps it at the water the cell holds. Reads last
   * step's flux from one copy and writes the other, so neighbours never see a half-written step.
   */
  const accelerateFrom = (before: number) => {
    const from = fluxes[before].as("readonly");
    const to = fluxes[1 - before].as("mutable");

    const levelOf = (column: number, row: number, fallback: number) => {
      "use gpu";
      if (!inside(column, row)) {
        return fallback;
      }
      const index = indexOf(column, row);
      return floorOf(index) + depthIn.$[index];
    };

    const pipesOf = (column: number, row: number, fallback: d.v4f) => {
      "use gpu";
      if (!inside(column, row)) {
        return d.vec4f(fallback);
      }
      return d.vec4f(from.$[indexOf(column, row)]);
    };

    return tgpu.computeFn({
      workgroupSize: [WORKGROUP, WORKGROUP],
      in: { id: d.builtin.globalInvocationId },
    })(({ id }) => {
      "use gpu";
      if (id.x >= CELLS || id.y >= CELLS) {
        return;
      }
      const column = d.i32(id.x);
      const row = d.i32(id.y);
      const index = indexOf(column, row);
      const water = depthIn.$[index];
      const level = floorOf(index) + water;
      const dt = sim.$.dt;

      // Past the land edges the ground falls away, so water runs off the map instead of piling
      // up against it. The sea's sides are closed, so the wave keeps its shape along them
      const floor = floorOf(index);
      const beyond = std.select(level, floor, floor >= 0);
      const drop =
        d.vec4f(level) -
        d.vec4f(
          levelOf(column - 1, row, beyond),
          levelOf(column + 1, row, beyond),
          levelOf(column, row - 1, level),
          levelOf(column, row + 1, beyond),
        );
      const own = d.vec4f(from.$[index]);
      const around =
        (pipesOf(column - 1, row, own) +
          pipesOf(column + 1, row, own) +
          pipesOf(column, row - 1, own) +
          pipesOf(column, row + 1, own)) *
        0.25;
      let out = own * KEEP + (around - own) * VISCOSITY + drop * (dt * GRAVITY * water);
      out = std.max(d.vec4f(0), out);

      // Manning friction: the thinner and faster the water, the harder the ground holds it back
      const deep = std.max(water, DRY);
      const speed = out / (CELL * deep);
      const drag = (dt * GRAVITY * ROUGHNESS * ROUGHNESS) / std.pow(deep, 4 / 3);
      out = out / (d.vec4f(1) + speed * drag);

      const leaving = (out.x + out.y + out.z + out.w) * dt;
      const held = water * CELL * CELL;
      if (leaving > held) {
        out = out * (held / leaving);
      }
      to.$[index] = d.vec4f(out);
    });
  };

  /** Moves water along the pipes, then measures how fast it flows through the cell. */
  const moveWith = (copy: number) => {
    const flux = fluxes[copy].as("readonly");

    const inflowFrom = (column: number, row: number, pipe: number) => {
      "use gpu";
      if (!inside(column, row)) {
        return d.f32(0);
      }
      return flux.$[indexOf(column, row)][pipe];
    };

    return tgpu.computeFn({
      workgroupSize: [WORKGROUP, WORKGROUP],
      in: { id: d.builtin.globalInvocationId },
    })(({ id }) => {
      "use gpu";
      if (id.x >= CELLS || id.y >= CELLS) {
        return;
      }
      const column = d.i32(id.x);
      const row = d.i32(id.y);
      const index = indexOf(column, row);
      const out = flux.$[index];
      const fromLeft = inflowFrom(column - 1, row, 1);
      const fromRight = inflowFrom(column + 1, row, 0);
      const fromBack = inflowFrom(column, row - 1, 3);
      const fromFront = inflowFrom(column, row + 1, 2);

      const dt = sim.$.dt;
      const before = depthOut.$[index];
      const gained = fromLeft + fromRight + fromBack + fromFront - (out.x + out.y + out.z + out.w);
      let after = std.max(before + (gained * dt) / (CELL * CELL), 0);

      // The sea edge holds the sea level, so raising it sends a wave inland
      if (row < SOURCE_ROWS) {
        after = std.max(sim.$.sea - floorOf(index), 0);
      }
      depthOut.$[index] = after;

      const mean = std.max((before + after) / 2, 0.05);
      const across = (fromLeft - out.x + out.y - fromRight) / 2;
      const along = (fromBack - out.z + out.w - fromFront) / 2;
      const flow = d.vec2f(across, along) / (CELL * mean);
      const speed = std.length(flow);
      velocityOut.$[index] = flow * std.min(1, TOP_SPEED / std.max(speed, 0.0001));
    });
  };

  const stepping = [0, 1].map((copy) => ({
    accelerate: root.createComputePipeline({ compute: accelerateFrom(copy) }),
    move: root.createComputePipeline({ compute: moveWith(1 - copy) }),
  }));
  const groups = Math.ceil(CELLS / WORKGROUP);
  let parity = 0;

  // ---- Picture -----------------------------------------------------------------------------

  /** Surface height, depth, speed and foam per cell, which the water drawing samples smoothly. */
  const picture = root
    .createTexture({ size: [CELLS, CELLS], format: "rgba16float" })
    .$usage("storage", "sampled");
  const pictureOut = picture.createView(d.textureStorage2d("rgba16float", "write-only"));
  const pictureIn = picture.createView(d.texture2d(d.f32));
  /** Water velocity per cell in metres per second, for ripples that drift with the current. */
  const currents = root
    .createTexture({ size: [CELLS, CELLS], format: "rgba16float" })
    .$usage("storage", "sampled");
  const currentsOut = currents.createView(d.textureStorage2d("rgba16float", "write-only"));
  const currentsIn = currents.createView(d.texture2d(d.f32));
  const smooth = root.createSampler({ magFilter: "linear", minFilter: "linear" });

  /** Foam at a point in cell units, blended from the four nearest cells. */
  const foamAt = (at: d.v2f) => {
    "use gpu";
    const kept = std.clamp(at, d.vec2f(0), d.vec2f(CELLS - 1.001));
    const corner = d.vec2i(std.floor(kept));
    const t = kept - std.floor(kept);
    const a = foamBefore.$[indexOf(corner.x, corner.y)];
    const b = foamBefore.$[indexOf(corner.x + 1, corner.y)];
    const c = foamBefore.$[indexOf(corner.x, corner.y + 1)];
    const e = foamBefore.$[indexOf(corner.x + 1, corner.y + 1)];
    return std.mix(std.mix(a, b, t.x), std.mix(c, e, t.x), t.y);
  };

  /**
   * Carries last frame's foam along the flow, fades it, and whips up more where the water runs
   * fast or its surface breaks steeply, as at the wave's front and behind each corner.
   */
  const churn = tgpu.computeFn({
    workgroupSize: [WORKGROUP, WORKGROUP],
    in: { id: d.builtin.globalInvocationId },
  })(({ id }) => {
    "use gpu";
    if (id.x >= CELLS || id.y >= CELLS) {
      return;
    }
    const column = d.i32(id.x);
    const row = d.i32(id.y);
    const index = indexOf(column, row);
    const water = depthIn.$[index];
    if (water < DRY) {
      foamCarried.$[index] = 0;
      return;
    }
    const flow = velocityIn.$[index];
    const dt = look.$.dt;
    const carried = foamAt(d.vec2f(id.xy) - (flow * dt) / CELL) * std.exp(-dt / FOAM_LIFE);

    const level = floorOf(index) + water;
    let steepest = d.f32(0);
    for (const offset of tgpu.unroll([
      d.vec2i(-1, 0),
      d.vec2i(1, 0),
      d.vec2i(0, -1),
      d.vec2i(0, 1),
    ])) {
      const next = d.vec2i(column, row) + offset;
      if (inside(next.x, next.y)) {
        const other = indexOf(next.x, next.y);
        if (depthIn.$[other] > DRY) {
          steepest = std.max(steepest, std.abs(floorOf(other) + depthIn.$[other] - level) / CELL);
        }
      }
    }
    const fast = std.smoothstep(4, 11, std.length(flow));
    const breaking = std.smoothstep(0.4, 1.2, steepest);
    const thin = std.smoothstep(0.6, 0.05, water) * std.smoothstep(1, 4, std.length(flow));
    const whipped = (fast * 0.25 + breaking * 0.9 + thin * 0.3) * dt;
    foamCarried.$[index] = std.saturate(carried + whipped);
  });

  /**
   * Writes the picture. Wet cells show their surface, softened toward wet neighbours so the
   * grid never shows. A dry cell next to water takes their level, but no higher than its own
   * floor, so the surface meets sloping ground at a real shoreline and slips inside walls.
   */
  const paint = tgpu.computeFn({
    workgroupSize: [WORKGROUP, WORKGROUP],
    in: { id: d.builtin.globalInvocationId },
  })(({ id }) => {
    "use gpu";
    if (id.x >= CELLS || id.y >= CELLS) {
      return;
    }
    const column = d.i32(id.x);
    const row = d.i32(id.y);
    const index = indexOf(column, row);
    const water = depthIn.$[index];
    const floor = floorOf(index);

    let sum = d.f32(0);
    let weight = d.f32(0);
    for (const offset of tgpu.unroll([
      d.vec2i(-1, -1),
      d.vec2i(0, -1),
      d.vec2i(1, -1),
      d.vec2i(-1, 0),
      d.vec2i(1, 0),
      d.vec2i(-1, 1),
      d.vec2i(0, 1),
      d.vec2i(1, 1),
    ])) {
      const next = d.vec2i(column, row) + offset;
      if (inside(next.x, next.y)) {
        const other = indexOf(next.x, next.y);
        if (depthIn.$[other] > DRY) {
          const near = 1 / std.length(d.vec2f(offset));
          sum += (floorOf(other) + depthIn.$[other]) * near;
          weight += near;
        }
      }
    }

    let level = groundIn.$[index] - 1;
    if (water > DRY) {
      level = floor + water;
      if (weight > 0) {
        level = std.mix(level, sum / weight, 0.35);
      }
    } else if (weight > 0) {
      level = std.min(sum / weight, floor);
    }
    const foam = foamIn.$[index];
    foamKept.$[index] = foam;
    const flow = velocityIn.$[index];
    std.textureStore(
      pictureOut.$,
      id.xy,
      d.vec4f(level, std.max(water, 0), std.length(flow), foam),
    );
    std.textureStore(currentsOut.$, id.xy, d.vec4f(flow, 0, 0));
  });

  const churning = root.createComputePipeline({ compute: churn });
  const painting = root.createComputePipeline({ compute: paint });

  // ---- Push on buildings -------------------------------------------------------------------

  const buildingCount = layout.buildings.length;
  const slots = Math.max(buildingCount + options.walls, 1);
  const Push = d.struct({ x: d.atomic(d.i32), z: d.atomic(d.i32) });
  const push = root.createBuffer(d.arrayOf(Push, slots)).$usage("storage");
  const pushOut = push.as("mutable");
  const ownerIn = owner.as("readonly");
  const nothing = new Array(slots).fill({ x: 0, z: 0 });
  const pushes = new Float32Array(slots * 2);
  const pushProbe = readback.create(root, push, {
    bytes: true,
    hz: PUSH_RATE,
    decode: (bytes) => {
      const units = new Int32Array(bytes);
      for (let i = 0; i < pushes.length; i++) pushes[i] = units[i] / PUSH_UNITS;
      return pushes;
    },
  });

  /**
   * Adds the push of each wet cell on the buildings beside it. Water running into a wall stops
   * there, so the wall takes its dynamic pressure, half rho v squared, over the wet height of
   * one cell's width. The pushes add up into a force on the whole building, in kilonewtons.
   */
  const press = tgpu.computeFn({
    workgroupSize: [WORKGROUP, WORKGROUP],
    in: { id: d.builtin.globalInvocationId },
  })(({ id }) => {
    "use gpu";
    if (id.x >= CELLS || id.y >= CELLS) {
      return;
    }
    const column = d.i32(id.x);
    const row = d.i32(id.y);
    const index = indexOf(column, row);
    const water = depthIn.$[index];
    if (ownerIn.$[index] !== 0 || water < 0.05) {
      return;
    }
    const flow = velocityIn.$[index];
    for (const offset of tgpu.unroll([
      d.vec2i(-1, 0),
      d.vec2i(1, 0),
      d.vec2i(0, -1),
      d.vec2i(0, 1),
    ])) {
      const next = d.vec2i(column, row) + offset;
      if (inside(next.x, next.y)) {
        const building = ownerIn.$[indexOf(next.x, next.y)];
        if (building !== 0) {
          const toward = d.vec2f(offset);
          const into = std.max(std.dot(flow, toward), 0);
          let force = 0.5 * DENSITY * into * into * water * CELL;
          // A wall also takes the weight of the water standing against it, half rho g h squared:
          // it has dry ground behind it, where a building has water on every side
          if (building > buildingCount) {
            force += 0.5 * DENSITY * GRAVITY * water * water * CELL;
          }
          const units = d.vec2i(toward * (force * PUSH_UNITS));
          std.atomicAdd(pushOut.$[building - 1].x, units.x);
          std.atomicAdd(pushOut.$[building - 1].z, units.y);
        }
      }
    }
  });
  const pressing = root.createComputePipeline({ compute: press });

  // ---- What other systems read -------------------------------------------------------------

  const uvOf = (place: d.v2f) => {
    "use gpu";
    return ((place + SPAN / 2) / CELL + 0.5) / CELLS;
  };

  /** The water surface height and depth at a point in the world, for things that float. */
  const waterAt = (place: d.v2f) => {
    "use gpu";
    return std.textureSampleLevel(pictureIn.$, smooth.$, uvOf(place), 0).xy;
  };

  /** The current at a point in the world, in metres per second along x and z. */
  const currentAt = (place: d.v2f) => {
    "use gpu";
    return std.textureSampleLevel(currentsIn.$, smooth.$, uvOf(place), 0).xy;
  };

  const cellAt = (place: d.v2f) => {
    "use gpu";
    const cell = d.vec2i(std.round((place + SPAN / 2) / CELL));
    const kept = std.clamp(cell, d.vec2i(0), d.vec2i(CELLS - 1));
    return indexOf(kept.x, kept.y);
  };

  /** The height of the bare ground at a point, without buildings or rubble. */
  const groundAt = (place: d.v2f) => {
    "use gpu";
    return groundIn.$[cellAt(place)];
  };

  /** The height of the ground, or of the rubble and walls on it, at a point in the world. */
  const floorAt = (place: d.v2f) => {
    "use gpu";
    return floorOf(cellAt(place));
  };

  // ---- Drawing -----------------------------------------------------------------------------

  const Corner = d.struct({ position: d.vec4f, world: d.vec3f, uv: d.vec2f });
  const Seen = d.struct({ color: d.vec4f });

  /** Two triangles per grid square, built from the vertex index with no vertex buffer. */
  const CORNERS = tgpu.const(d.arrayOf(d.vec2i, 6), [
    d.vec2i(0, 0),
    d.vec2i(1, 0),
    d.vec2i(0, 1),
    d.vec2i(0, 1),
    d.vec2i(1, 0),
    d.vec2i(1, 1),
  ]);
  const squares = CELLS - 1;
  const TEXEL = 1 / CELLS;

  const sampleAt = (uv: d.v2f) => {
    "use gpu";
    return std.textureSampleLevel(pictureIn.$, smooth.$, uv, 0);
  };

  const WAVE_SHAPES = tgpu.const(
    d.arrayOf(d.vec4f, WAVES.length),
    WAVES.map(([x, z, length, height]) => {
      const number = (2 * Math.PI) / length;
      return d.vec4f(x, z, number, height);
    }),
  );
  /** Each wave's speed in radians per second, from deep-water dispersion: sqrt(g * k). */
  const WAVE_SPEEDS = tgpu.const(
    d.arrayOf(d.f32, WAVES.length),
    WAVES.map(([, , length]) => Math.sqrt((GRAVITY * 2 * Math.PI) / length)),
  );

  /**
   * The slope of the wind waves at a point, each wave faded out where a pixel spans more than about
   * a quarter of its wavelength, so distant water never shows a stripe pattern.
   */
  const slopeOf = (place: d.v2f, time: number, footprint: number) => {
    "use gpu";
    let slope = d.vec2f(0);
    for (let i = 0; i < WAVES.length; i++) {
      const wave = WAVE_SHAPES.$[i];
      const fade = std.saturate(1.5 - (footprint * wave.z * 4) / (2 * Math.PI));
      const phase = wave.z * std.dot(wave.xy, place) - WAVE_SPEEDS.$[i] * time;
      slope += wave.xy * (wave.w * wave.z * std.cos(phase) * fade);
    }
    return slope;
  };

  /**
   * Wind waves carried by the current with a flow map: two copies of the pattern slide along the
   * flow, each restarting while the other is fully shown, so the pattern never stretches.
   */
  const carriedSlopeOf = (place: d.v2f, flow: d.v2f, time: number, footprint: number) => {
    "use gpu";
    const first = std.fract(time / FLOW_PERIOD);
    const second = std.fract(time / FLOW_PERIOD + 0.5);
    const a = slopeOf(place - flow * (first * FLOW_PERIOD), time, footprint);
    const b = slopeOf(place - flow * (second * FLOW_PERIOD) + 13, time, footprint);
    return std.mix(a, b, std.abs(first * 2 - 1));
  };

  const drawing = passes.drawing({
    label: "water",
    Vertex: Corner,
    at: (vertexIndex: number) => {
      "use gpu";
      const square = d.i32(vertexIndex / 6);
      const cell = d.vec2i(square % squares, d.i32(square / squares)) + CORNERS.$[vertexIndex % 6];
      const level = std.textureLoad(pictureIn.$, cell, 0).x;
      const world = d.vec3f(
        d.f32(cell.x) * CELL - SPAN / 2,
        level,
        d.f32(cell.y) * CELL - SPAN / 2,
      );
      const uv = (d.vec2f(cell) + 0.5) * TEXEL;
      return Corner({ position: cameras.toClip(world), world, uv });
    },
    pixelOf: (corner) => {
      "use gpu";
      // Pixel footprint in metres, taken before any branch
      const footprint = std.length(std.fwidth(corner.world.xz));
      const here = sampleAt(corner.uv);
      const water = here.y;
      const body = 1 - std.exp(-water * TURBIDITY);
      if (body < 0.004) {
        std.discard();
      }
      const speed = here.z;

      // The surface's slope from the smoothed picture, then ripples on top, choppier when fast
      const across = d.vec2f(TEXEL, 0);
      const along = d.vec2f(0, TEXEL);
      const dx = sampleAt(corner.uv + across).x - sampleAt(corner.uv - across).x;
      const dz = sampleAt(corner.uv + along).x - sampleAt(corner.uv - along).x;
      const place = corner.world.xz;
      const time = look.$.time;
      const current = std.textureSampleLevel(currentsIn.$, smooth.$, corner.uv, 0).xy;
      const flow = current * std.min(1, FLOW_LIMIT / std.max(std.length(current), 0.001));
      // One noise sample both breaks up the foam and bends the wave field, so the sum of sines
      // never reads as a regular lattice
      const noise = perlin2d.sample(place * 0.23 + d.vec2f(time * 0.04));
      const warped = place + d.vec2f(noise, -noise) * 2.5;
      const waves = carriedSlopeOf(warped, flow, time, footprint);
      const chop = (0.06 + std.smoothstep(0.5, 6, speed) * 0.3) * std.smoothstep(0.02, 0.4, water);
      const normal = std.normalize(
        d.vec3f(-dx / (2 * CELL) - waves.x * chop, 1, -dz / (2 * CELL) - waves.y * chop),
      );

      // Foam breaks into patches and streaks rather than a flat white sheet
      const breakup = noise * 0.6 + waves.x * 0.25;
      const foam = std.smoothstep(0.35, 0.8, here.w + breakup * 0.5) * 0.85;

      const silt = std.mix(SILT, MURK, std.smoothstep(0.3, 5, water));
      const tint = std.mix(silt, FOAM, foam);
      const surface = materials.glossy(tint, std.mix(0.06, 0.55, foam));
      const point = shading.pointAt(corner.world, normal);
      // Water mirrors the sky at grazing angles: Fresnel with water's 2% reflectance head-on
      const facing = std.saturate(std.dot(point.normal, point.view));
      const mirror = (0.02 + 0.98 * std.pow(1 - facing, 5)) * (1 - foam) * 0.85;
      const sky = environment.reflection(std.reflect(point.view * -1, point.normal), 0.05);
      const lit = std.mix(shading.shade(surface, point), sky, mirror);
      const alpha = std.max(body, foam * std.smoothstep(0.01, 0.08, water));
      return Seen({ color: d.vec4f(lit * alpha, alpha) });
    },
    color: passes.shaded,
    translucent: true,
    primitive: { cullMode: "none" },
    draw: (pass) => pass.draw(squares * squares * 6),
  });

  const Side = d.struct({ position: d.vec4f, world: d.vec3f, normal: d.vec3f, below: d.f32 });

  /** The cut through the water along each side of the map, from the ground up to the surface. */
  const sides = passes.drawing({
    label: "water walls",
    Vertex: Side,
    at: (vertexIndex: number) => {
      "use gpu";
      const edge = edgeVertexOf(vertexIndex);
      const here = std.textureLoad(pictureIn.$, edge.cell, 0);
      const bottom = groundIn.$[indexOf(edge.cell.x, edge.cell.y)];
      // A dry border cell folds its quad flat onto the ground
      const top = std.select(bottom, std.max(here.x, bottom), here.y > DRY);
      const y = std.mix(bottom, top, edge.top);
      const world = d.vec3f(placeOf(edge.cell).x, y, placeOf(edge.cell).y);
      return Side({
        position: cameras.toClip(world),
        world,
        normal: d.vec3f(edge.normal),
        below: top - y,
      });
    },
    pixelOf: (side) => {
      "use gpu";
      // Light fades with depth through silty water; a band of light just under the surface
      const deep = 1 - std.exp(-side.below * 0.6);
      const color = std.mix(SILT, MURK * 0.45, deep);
      const lit = shading.shade(
        materials.glossy(color, 0.1),
        shading.pointAt(side.world, side.normal),
      );
      const alpha = std.mix(0.75, 0.95, deep);
      return Seen({ color: d.vec4f(lit * alpha, alpha) });
    },
    color: passes.shaded,
    translucent: true,
    primitive: { cullMode: "none" },
    draw: (pass) => pass.draw(EDGE_VERTICES),
  });

  const fresh = (values: Layout) => {
    depth.write(Array.from(values.depth));
    for (const flux of fluxes) flux.write(new Array(count).fill(d.vec4f()));
    for (const foam of foams) foam.write(new Array(count).fill(0));
    velocity.write(new Array(count).fill(d.vec2f()));
    parity = 0;
  };
  fresh(layout);

  return {
    sim,
    /** Terrain height per cell, which the terrain mesh is baked from. */
    ground,
    drawing,
    sides,
    initAsync: () =>
      pipelines.compile([
        ...stepping.flatMap((step) => [step.accelerate, step.move]),
        churning,
        painting,
        pressing,
      ]),

    /** Records one simulation step into an open compute pass. */
    step(pass: TgpuComputePass) {
      const step = stepping[parity];
      pass.setPipeline(step.accelerate);
      pass.dispatchWorkgroups(groups, groups);
      pass.setPipeline(step.move);
      pass.dispatchWorkgroups(groups, groups);
      parity = 1 - parity;
    },

    /** Records the picture the drawing reads, once a frame after the steps. */
    paint(pass: TgpuComputePass, seconds: number, time: number) {
      look.write({ dt: seconds, time });
      pass.setPipeline(churning);
      pass.dispatchWorkgroups(groups, groups);
      pass.setPipeline(painting);
      pass.dispatchWorkgroups(groups, groups);
      push.write(nothing);
      pass.setPipeline(pressing);
      pass.dispatchWorkgroups(groups, groups);
    },

    /** Copies the push on every building toward the CPU, after the pass that painted ends. */
    capture(frame: Frame) {
      pushProbe.capture(frame);
    },

    /** The latest push on every building in kilonewtons, as x and z pairs, once it arrives. */
    get pushes() {
      return pushProbe.latest;
    },

    /** Replaces which structure stands on each cell, as walls are built, removed or broken. */
    reowner(values: Uint32Array) {
      owner.write(Array.from(values));
    },

    /** Replaces the solid heights above the ground, as when a building falls to a heap. */
    rebuild(values: Float32Array) {
      solid.write(Array.from(values));
    },

    waterAt,
    currentAt,
    floorAt,
    groundAt,

    /** Back to the calm sea of the layout. */
    reset(values: Layout) {
      fresh(values);
      solid.write(Array.from(values.solid));
      pushProbe.reset();
    },

    destroy() {
      for (const made of [
        pushProbe,
        push,
        owner,
        ground,
        solid,
        depth,
        velocity,
        ...fluxes,
        ...foams,
        picture,
        currents,
      ]) {
        made.destroy();
      }
    },
  };
}
