import { d, std, tgpu } from "typegpu";

import { CELL_COUNT, GRID_HEIGHT, GRID_WIDTH } from "../../../../../../../../simulation/grid";

const width = d.u32(GRID_WIDTH);
const height = d.u32(GRID_HEIGHT);

/**
 * Two storage buffers with the same layout. `current` is read, `next` is written.
 * The screen swaps which buffer is which after every dispatch, so a cell never
 * reads a neighbour that this generation already replaced.
 */
export const lifeLayout = tgpu.bindGroupLayout({
  current: { storage: d.arrayOf(d.u32, CELL_COUNT) },
  next: { storage: d.arrayOf(d.u32, CELL_COUNT), access: "mutable" },
  // One atomic per row. Cleared before the step; each living cell adds 1.
  rows: { storage: d.arrayOf(d.atomic(d.u32), GRID_HEIGHT), access: "mutable" },
  // Written in the same thread as `next`, so the picture cannot lag the cells.
  picture: { storageTexture: d.textureStorage2d("rgba8unorm") },
});

/** Plain copy of `rows` so JavaScript can read the totals after the step. */
export const copyLayout = tgpu.bindGroupLayout({
  rows: { storage: d.arrayOf(d.atomic(d.u32), GRID_HEIGHT), access: "mutable" },
  plain: { storage: d.arrayOf(d.u32, GRID_HEIGHT), access: "mutable" },
});

/**
 * What the fragment shader is looking at.
 * `origin` is the cell under the top-left pixel, `span` is how many cells the
 * screen covers, `pixels` is the canvas size. `pad` rounds the uniform up to 16 bytes.
 */
export const cameraSchema = d.struct({
  origin: d.vec2f,
  span: d.vec2f,
  pixels: d.vec2f,
  pad: d.vec2f,
});

/** The texture the step just wrote, plus the camera for this frame. */
export const drawLayout = tgpu.bindGroupLayout({
  picture: { texture: d.texture2d() },
  camera: { uniform: cameraSchema },
});

function cellIndex(x: number, y: number): number {
  "use gpu";
  return (y % height) * width + (x % width);
}

function readCell(x: number, y: number): number {
  "use gpu";
  return lifeLayout.$.current[cellIndex(x, y)];
}

function countNeighbors(x: number, y: number): number {
  "use gpu";
  return (
    readCell(x - 1, y - 1) +
    readCell(x, y - 1) +
    readCell(x + 1, y - 1) +
    readCell(x - 1, y) +
    readCell(x + 1, y) +
    readCell(x - 1, y + 1) +
    readCell(x, y + 1) +
    readCell(x + 1, y + 1)
  );
}

/**
 * One generation of Conway's Life (B3/S23), one thread per cell.
 * A dead cell with 3 neighbours is born. A live cell with 2 or 3 neighbours stays.
 * Anything else dies. The grid wraps, so an edge cell sees the opposite edge.
 * `x - 1` on an unsigned index wraps before `%`, which is the wrap-around.
 */
export function writeNextCell(x: number, y: number) {
  "use gpu";
  const neighbors = countNeighbors(x, y);
  const alive = readCell(x, y) === 1;
  const next = d.u32(std.select(neighbors === 3, neighbors === 2 || neighbors === 3, alive));

  lifeLayout.$.next[cellIndex(x, y)] = next;
  std.textureStore(
    lifeLayout.$.picture,
    d.vec2u(d.u32(x), d.u32(y)),
    std.select(d.vec4f(0.06, 0.07, 0.08, 1), d.vec4f(0.62, 0.93, 0.45, 1), next === 1),
  );

  if (next === 1) {
    std.atomicAdd(lifeLayout.$.rows[y], d.u32(1));
  }
}

/** One thread per row. Copies the atomic total into a buffer JavaScript can read. */
export function copyRowCount(y: number) {
  "use gpu";
  copyLayout.$.plain[y] = std.atomicLoad(copyLayout.$.rows[y]);
}

const SAMPLE_SPAN = 8;

const DEAD = d.vec4f(0.06, 0.07, 0.08, 1);

/**
 * Samples the cells behind one screen pixel. Zoomed out, that is an average,
 * so the field goes dark as the living count falls. Zoomed in, the samples
 * land in one cell and it draws as a solid block.
 */
export const drawCells = tgpu.fragmentFn({
  in: { uv: d.vec2f },
  out: d.vec4f,
})(({ uv }) => {
  const camera = drawLayout.$.camera;
  const spanX = camera.span.x / camera.pixels.x;
  const spanY = camera.span.y / camera.pixels.y;
  const originX = camera.origin.x + uv.x * camera.span.x;
  const originY = camera.origin.y + uv.y * camera.span.y;
  let color = d.vec4f();

  for (const row of tgpu.unroll(std.range(SAMPLE_SPAN))) {
    for (const column of tgpu.unroll(std.range(SAMPLE_SPAN))) {
      const x = d.i32(originX + ((d.f32(column) + 0.5) * spanX) / SAMPLE_SPAN);
      const y = d.i32(originY + ((d.f32(row) + 0.5) * spanY) / SAMPLE_SPAN);
      const inside =
        x >= d.i32(0) && x < d.i32(GRID_WIDTH) && y >= d.i32(0) && y < d.i32(GRID_HEIGHT);
      const texel = std.textureLoad(
        drawLayout.$.picture,
        d.vec2i(
          std.clamp(x, d.i32(0), d.i32(GRID_WIDTH - 1)),
          std.clamp(y, d.i32(0), d.i32(GRID_HEIGHT - 1)),
        ),
        0,
      );
      color = std.add(color, std.select(DEAD, texel, inside));
    }
  }

  return std.div(color, SAMPLE_SPAN * SAMPLE_SPAN);
});
