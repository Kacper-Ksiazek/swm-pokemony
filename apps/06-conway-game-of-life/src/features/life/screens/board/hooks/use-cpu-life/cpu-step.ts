import { CELL_COUNT, GRID_HEIGHT, GRID_WIDTH, seedCells } from "../../../../simulation/grid";

/** Rows advanced on one JavaScript frame. A full 4096-row generation takes many frames. */
const ROWS_PER_FRAME = 8;

export type CpuSim = {
  current: Uint32Array;
  next: Uint32Array;
  row: number;
  pendingLiving: number;
  living: number;
  epoch: number;
};

export function createCpuSim(): CpuSim {
  const seeded = seedCells();

  return {
    current: seeded.cells,
    next: new Uint32Array(CELL_COUNT),
    row: 0,
    pendingLiving: 0,
    living: seeded.living,
    epoch: 0,
  };
}

/**
 * One slice of Conway's Life (B3/S23) on the CPU.
 * The grid wraps, matching the GPU step. Returns true when this slice finished a generation.
 */
export function stepCpuFrame(sim: CpuSim): boolean {
  const y1 = Math.min(sim.row + ROWS_PER_FRAME, GRID_HEIGHT);
  sim.pendingLiving += writeRows(sim.current, sim.next, sim.row, y1);
  sim.row = y1;

  if (sim.row < GRID_HEIGHT) {
    return false;
  }

  const finished = sim.current;
  sim.current = sim.next;
  sim.next = finished;
  sim.living = sim.pendingLiving;
  sim.pendingLiving = 0;
  sim.row = 0;
  sim.epoch += 1;

  return true;
}

function writeRows(current: Uint32Array, next: Uint32Array, y0: number, y1: number): number {
  let living = 0;

  for (let y = y0; y < y1; y += 1) {
    const row = y * GRID_WIDTH;

    for (let x = 0; x < GRID_WIDTH; x += 1) {
      const neighbors = countNeighbors(current, x, y);
      const alive = current[row + x] === 1;
      const stays = alive ? neighbors === 2 || neighbors === 3 : neighbors === 3;
      next[row + x] = stays ? 1 : 0;
      living += stays ? 1 : 0;
    }
  }

  return living;
}

function countNeighbors(cells: Uint32Array, x: number, y: number): number {
  return (
    readCell(cells, x - 1, y - 1) +
    readCell(cells, x, y - 1) +
    readCell(cells, x + 1, y - 1) +
    readCell(cells, x - 1, y) +
    readCell(cells, x + 1, y) +
    readCell(cells, x - 1, y + 1) +
    readCell(cells, x, y + 1) +
    readCell(cells, x + 1, y + 1)
  );
}

function readCell(cells: Uint32Array, x: number, y: number): number {
  const wrappedX = (x + GRID_WIDTH) % GRID_WIDTH;
  const wrappedY = (y + GRID_HEIGHT) % GRID_HEIGHT;

  return cells[wrappedY * GRID_WIDTH + wrappedX] === 1 ? 1 : 0;
}
