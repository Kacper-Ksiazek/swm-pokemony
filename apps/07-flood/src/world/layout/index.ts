/**
 * The town on the coast, as plain numbers. No GPU imports: the simulation and the renderers read
 * these arrays, and the rules stay testable on the CPU.
 */
export { CELL, CELLS, centreOf, SIZE, SPAN } from "./grid";
export {
  BLOCK,
  ISLET,
  PROMENADE,
  ROAD,
  ROADS_ACROSS,
  ROADS_ALONG,
  SEA_EDGE,
  SHORE,
  TOWN,
} from "./town";
export { groundAt, isRoad } from "./ground";
export {
  type Building,
  type Color,
  HOME_WINDOWS,
  type Kind,
  NO_WINDOWS,
  OFFICE_WINDOWS,
  type Part,
} from "./buildings";
export { createLayout, type Layout, seeded } from "./layout";
