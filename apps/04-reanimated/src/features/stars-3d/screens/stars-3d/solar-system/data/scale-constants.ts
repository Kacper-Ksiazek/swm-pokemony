/** Semi-real solar system scales, compressed so the full system fits on a phone. */

export const SUN_DISPLAY_SIZE = 32;

export const EARTH_ORBIT_AU = 1;
/** Earth center-to-sun center distance when the sun was 32px wide (70px − 16px radius). */
export const EARTH_ORBIT_GAP_FROM_SUN_SURFACE_PX = 54;
export const EARTH_ORBIT_RADIUS_PX = SUN_DISPLAY_SIZE / 2 + EARTH_ORBIT_GAP_FROM_SUN_SURFACE_PX;
export const EARTH_ORBIT_VELOCITY = 0.65;
export const EARTH_DIAMETER_RELATIVE = 1;
export const EARTH_SPIN_RATE = 1.2;

/** Distances: AU raised to this power (1 = linear); <1 compresses outer planets. */
export const ORBIT_AU_EXPONENT = 0.265;

/** Sun diameter / Earth diameter. The Sun's display size is 100% of body width. */
export const SUN_EARTH_DIAMETER_RATIO = 109.2;

/** Planet diameters as a fraction of the Sun, raised to this power so they stay visible. */
export const SIZE_RELATIVE_EXPONENT = 0.38;
