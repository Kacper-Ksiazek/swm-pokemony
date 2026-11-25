import type { TgpuReadonly } from "typegpu";
import { d, std, tgpu } from "typegpu";

import { CELL, CELLS, SPAN } from "@/world/layout";

import { indexOf, inside } from "./grid";
import type { Cells, Vec2Cells } from "./grid";
import type { createPicture } from "./picture";

type Picture = ReturnType<typeof createPicture>;

/**
 * Reads the picture at a world point. Boats, cars, debris and spray call these from their own
 * shaders, and the sensors copy the same values back to the CPU.
 */
export function createSamples(input: {
  readonly pictureIn: Picture["pictureIn"];
  readonly currentsIn: Picture["currentsIn"];
  readonly smooth: Picture["smooth"];
  readonly groundIn: TgpuReadonly<Cells>;
  readonly solidIn: TgpuReadonly<Cells>;
  readonly depthIn: TgpuReadonly<Cells>;
  readonly velocityIn: TgpuReadonly<Vec2Cells>;
}) {
  const { pictureIn, currentsIn, smooth, groundIn, solidIn, depthIn, velocityIn } = input;

  const floorOf = (index: number) => {
    "use gpu";
    return groundIn.$[index] + solidIn.$[index];
  };

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

  /**
   * How hard the flood strikes something at a cell: the point on the surface there, and in w the
   * speed at which the water runs into a neighbour that stands about as high as its surface, such
   * as a wall, a building, rubble or a steep shore. Zero where it strikes nothing.
   */
  const impactAt = (column: number, row: number) => {
    "use gpu";
    const index = indexOf(column, row);
    const water = depthIn.$[index];

    if (water < 0.2) {
      return d.vec4f(0);
    }

    const level = floorOf(index) + water;
    const flow = velocityIn.$[index];
    let hardest = d.f32(0);
    for (const offset of tgpu.unroll([
      d.vec2i(-1, 0),
      d.vec2i(1, 0),
      d.vec2i(0, -1),
      d.vec2i(0, 1),
    ])) {
      const next = d.vec2i(column, row) + offset;
      if (inside(next.x, next.y)) {
        if (floorOf(indexOf(next.x, next.y)) > level - 0.3) {
          hardest = std.max(hardest, std.dot(flow, d.vec2f(offset)));
        }
      }
    }

    return d.vec4f(d.f32(column) * CELL - SPAN / 2, level, d.f32(row) * CELL - SPAN / 2, hardest);
  };

  return { waterAt, currentAt, floorAt, groundAt, impactAt };
}
