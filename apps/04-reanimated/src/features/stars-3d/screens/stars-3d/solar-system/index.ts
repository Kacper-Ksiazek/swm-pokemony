/**
 * Semi-real solar system scales, compressed so the full system fits on a phone.
 * Copied from stars-2d: features do not import each other.
 */

export { PLANETS, SUN } from "./data/catalog";
export { maxOrbitRadius, SOLAR_SYSTEM_BODIES } from "./build-solar-system-bodies";
export { bodyDisplaySize, bodySpinRate, orbitRadiusPx, orbitVelocity } from "./display-scale";
export type { BodyFact, SolarSystemBody, SolarSystemBodyInfo } from "./types";
