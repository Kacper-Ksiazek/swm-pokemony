import { DETAILS_BY_BODY_ID } from "./data/body-details";
import { PLANETS, SUN } from "./data/catalog";
import { bodyDisplaySize, bodySpinRate, orbitRadiusPx, orbitVelocity } from "./display-scale";
import type { SolarSystemBodyInfo } from "./types";

export const maxOrbitRadius = Math.max(...PLANETS.map((body) => orbitRadiusPx(body.orbitalAu)));

export const SOLAR_SYSTEM_BODIES: SolarSystemBodyInfo[] = [
  {
    id: SUN.id,
    label: SUN.label,
    category: DETAILS_BY_BODY_ID[SUN.id].category,
    color: SUN.color,
    displaySize: SUN.displaySize,
    radius: 0,
    velocity: 0,
    angularVelocity: bodySpinRate(SUN.spinPeriodDays),
    includeOverlay: false,
    hasRing: false,
    description: DETAILS_BY_BODY_ID[SUN.id].description,
    facts: DETAILS_BY_BODY_ID[SUN.id].facts,
  },
  ...PLANETS.map((body) => {
    const radius = orbitRadiusPx(body.orbitalAu);
    const details = DETAILS_BY_BODY_ID[body.id];

    return {
      id: body.id,
      label: body.label,
      category: details.category,
      color: body.color,
      displaySize: bodyDisplaySize(body.diameterRelativeToEarth),
      radius,
      velocity: orbitVelocity(radius),
      angularVelocity: bodySpinRate(body.spinPeriodDays),
      includeOverlay: body.includeOverlay ?? true,
      hasRing: body.hasRing ?? false,
      parentId: SUN.id,
      description: details.description,
      facts: details.facts,
    };
  }),
  {
    id: "moon",
    label: "Księżyc",
    category: DETAILS_BY_BODY_ID.moon.category,
    color: "#D4D6DC",
    displaySize: 1.8,
    radius: 5.5,
    velocity: 2.6,
    angularVelocity: 0.2,
    includeOverlay: true,
    hasRing: false,
    parentId: "earth",
    description: DETAILS_BY_BODY_ID.moon.description,
    facts: DETAILS_BY_BODY_ID.moon.facts,
  },
  {
    id: "iss",
    label: "Stacja ISS",
    category: DETAILS_BY_BODY_ID.iss.category,
    color: "#7DD3FC",
    displaySize: 0.9,
    radius: 3.4,
    velocity: 5.5,
    angularVelocity: 1.8,
    includeOverlay: false,
    hasRing: false,
    parentId: "earth",
    description: DETAILS_BY_BODY_ID.iss.description,
    facts: DETAILS_BY_BODY_ID.iss.facts,
  },
];
