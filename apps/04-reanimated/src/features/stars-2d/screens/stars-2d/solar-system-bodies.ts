/** Semi-real solar system scales, compressed so the full system fits on a phone screen. */

const SUN_DISPLAY_SIZE = 32;

const EARTH_ORBIT_AU = 1;
/** Earth center-to-sun center distance when the sun was 32px wide (70px − 16px radius). */
const EARTH_ORBIT_GAP_FROM_SUN_SURFACE_PX = 54;
const EARTH_ORBIT_RADIUS_PX = SUN_DISPLAY_SIZE / 2 + EARTH_ORBIT_GAP_FROM_SUN_SURFACE_PX;
const EARTH_ORBIT_VELOCITY = 0.65;
const EARTH_DIAMETER_RELATIVE = 1;
const EARTH_DISPLAY_SIZE = 18;
const EARTH_SPIN_RATE = 1.2;

/** Distances: AU raised to this power (1 = linear); <1 compresses outer planets. */
const ORBIT_AU_EXPONENT = 0.265;

/** Giant-planet diameters vs Earth, raised to this power for on-screen size. */
const SIZE_RELATIVE_EXPONENT = 0.38;

export type SolarSystemBody = {
  id: string;
  label: string;
  color: `#${string}`;
  /** Diameter relative to Earth (Sun uses its own display size). */
  diameterRelativeToEarth: number;
  /** Mean distance from the Sun in AU. */
  orbitalAu: number;
  /** Sidereal rotation period in Earth days (negative = retrograde). */
  spinPeriodDays: number;
  includeOverlay?: boolean;
};

export const SUN: Pick<
  SolarSystemBody,
  "id" | "label" | "color" | "spinPeriodDays" | "includeOverlay"
> & {
  displaySize: number;
} = {
  id: "sun",
  label: "Słońce",
  color: "#FFD700",
  displaySize: SUN_DISPLAY_SIZE,
  spinPeriodDays: 25,
};

export const PLANETS: SolarSystemBody[] = [
  {
    id: "mercury",
    label: "Merkury",
    color: "#BCC1C8",
    diameterRelativeToEarth: 0.383,
    orbitalAu: 0.387,
    spinPeriodDays: 58.6,
  },
  {
    id: "venus",
    label: "Wenus",
    color: "#E8CDA0",
    diameterRelativeToEarth: 0.949,
    orbitalAu: 0.723,
    spinPeriodDays: -243,
  },
  {
    id: "earth",
    label: "Ziemia",
    color: "#4A90D9",
    diameterRelativeToEarth: EARTH_DIAMETER_RELATIVE,
    orbitalAu: EARTH_ORBIT_AU,
    spinPeriodDays: 1,
  },
  {
    id: "mars",
    label: "Mars",
    color: "#C1440E",
    diameterRelativeToEarth: 0.532,
    orbitalAu: 1.524,
    spinPeriodDays: 1.03,
  },
  {
    id: "jupiter",
    label: "Jowisz",
    color: "#C88B3A",
    diameterRelativeToEarth: 11.21,
    orbitalAu: 5.203,
    spinPeriodDays: 0.41,
  },
  {
    id: "saturn",
    label: "Saturn",
    color: "#E8D5A3",
    diameterRelativeToEarth: 9.45,
    orbitalAu: 9.537,
    spinPeriodDays: 0.45,
  },
  {
    id: "uranus",
    label: "Uran",
    color: "#72D5E8",
    diameterRelativeToEarth: 4.01,
    orbitalAu: 19.191,
    spinPeriodDays: 0.72,
  },
  {
    id: "neptune",
    label: "Neptun",
    color: "#3E54E8",
    diameterRelativeToEarth: 3.88,
    orbitalAu: 30.069,
    spinPeriodDays: 0.67,
  },
];

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
  const scale = Math.pow(diameterRelativeToEarth, SIZE_RELATIVE_EXPONENT);
  return Math.max(6, Math.round(EARTH_DISPLAY_SIZE * scale));
}

export function bodySpinRate(spinPeriodDays: number): number {
  return EARTH_SPIN_RATE / spinPeriodDays;
}

export const solarSystemLayoutSize = (() => {
  const maxOrbit = Math.max(...PLANETS.map((p) => orbitRadiusPx(p.orbitalAu)));
  const maxBody = Math.max(
    ...PLANETS.map((p) => bodyDisplaySize(p.diameterRelativeToEarth)),
    SUN.displaySize,
  );
  const margin = 24;
  const extent = maxOrbit + maxBody / 2 + margin;
  return extent * 2;
})();
