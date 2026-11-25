/** World width in metres along x and z. */
export const SIZE = 200;
/** Simulation cells per side. Terrain and water share this grid. */
export const CELLS = 320;

/** Metres across one cell. */
export const CELL = SIZE / CELLS;
/** Distance between the first and the last cell centre. */
export const SPAN = (CELLS - 1) * CELL;

/** World x or z of a cell centre. */
export const centreOf = (cell: number) => cell * CELL - SPAN / 2;
