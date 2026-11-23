import type { BoardPoint } from "../../../blueprint";

/** Spinner stands inside the college loop, next to the start. Board units. */
export const SPINNER_POSITION: BoardPoint = { x: 5.9, z: 3.2 };
export const SPINNER_RADIUS = 1.6;

/**
 * Land reaches this far from the nearest tile (or the spinner base); beyond it the table is water.
 * Board units.
 */
export const ISLAND_RADIUS = 1.9;

/** Distances above this are stored as "far" in the terrain field texture. Board units. */
export const FIELD_RANGE = 6;
/** Terrain field texture resolution (texels per side). */
export const FIELD_RESOLUTION = 128;

export const BOARD_THICKNESS = 0.6;
/** Road width covered by a tile, and the groove left between neighbouring tiles. Board units. */
export const TILE_WIDTH = 0.9;
export const TILE_GAP = 0.1;
export const TILE_HEIGHT = 0.16;

/** Camera looks down at the table from this elevation (radians above the horizon). */
export const CAMERA_ELEVATION = (52 * Math.PI) / 180;
/** Camera looks at the table corner-on (radians around Y), so the square board reads as a diamond. */
export const CAMERA_AZIMUTH = Math.PI / 4;
export const CAMERA_FOV = 34;

export const SKY_COLOR = 0xbfe4ff;
