export const GRID_WIDTH = 4096;
export const GRID_HEIGHT = 4096;
export const CELL_COUNT = GRID_WIDTH * GRID_HEIGHT;

export type Seed = {
  cells: Uint32Array;
  living: number;
};

/** About one fifth of the cells start alive. The sequence is fixed so a reload shows the same soup. */
export function seedCells(): Seed {
  const cells = new Uint32Array(CELL_COUNT);
  let state = 0xdecafbad;
  let living = 0;

  for (let index = 0; index < CELL_COUNT; index += 1) {
    state = Math.imul(state, 1664525) + 1013904223;
    const alive = (state >>> 0) % 5 === 0 ? 1 : 0;
    cells[index] = alive;
    living += alive;
  }

  return { cells, living };
}

/** Adds the per-row totals the GPU wrote. Dead cells are `CELL_COUNT - living`. */
export function sumRowCounts(rows: ArrayLike<number>): number {
  let living = 0;

  for (let index = 0; index < rows.length; index += 1) {
    living += rows[index];
  }

  return living;
}
