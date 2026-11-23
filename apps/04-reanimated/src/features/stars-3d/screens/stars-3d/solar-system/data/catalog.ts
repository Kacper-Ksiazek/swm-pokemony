import { EARTH_DIAMETER_RELATIVE, EARTH_ORBIT_AU, SUN_DISPLAY_SIZE } from "./scale-constants";
import type { SolarSystemBody } from "../types";

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
    hasRing: true,
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
