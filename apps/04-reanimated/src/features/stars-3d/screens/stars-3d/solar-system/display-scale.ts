import {
  EARTH_ORBIT_AU,
  EARTH_ORBIT_RADIUS_PX,
  EARTH_ORBIT_VELOCITY,
  EARTH_SPIN_RATE,
  ORBIT_AU_EXPONENT,
  SIZE_RELATIVE_EXPONENT,
  SUN_DISPLAY_SIZE,
  SUN_EARTH_DIAMETER_RATIO,
} from "./data/scale-constants";

export function orbitRadiusPx(orbitalAu: number): number {
  const scaledAu = Math.pow(orbitalAu / EARTH_ORBIT_AU, ORBIT_AU_EXPONENT);
  return Math.round(EARTH_ORBIT_RADIUS_PX * scaledAu);
}

/** Circular orbit speed ∝ 1/√r (Kepler), matched to Earth reference. */
export function orbitVelocity(radiusPx: number): number {
  if (radiusPx <= 0) {
    return 0;
  }

  return EARTH_ORBIT_VELOCITY * Math.sqrt(EARTH_ORBIT_RADIUS_PX / radiusPx);
}

export function bodyDisplaySize(diameterRelativeToEarth: number): number {
  const fractionOfSun = diameterRelativeToEarth / SUN_EARTH_DIAMETER_RATIO;
  const scale = Math.pow(fractionOfSun, SIZE_RELATIVE_EXPONENT);
  return Math.max(4, Math.round(SUN_DISPLAY_SIZE * scale));
}

export function bodySpinRate(spinPeriodDays: number): number {
  return EARTH_SPIN_RATE / spinPeriodDays;
}
