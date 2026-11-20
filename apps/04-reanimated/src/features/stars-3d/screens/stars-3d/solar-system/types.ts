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
  hasRing?: boolean;
};

export type BodyFact = {
  label: string;
  value: string;
  earthRef?: string;
};

export type SolarSystemBodyInfo = {
  id: string;
  label: string;
  category: string;
  color: `#${string}`;
  displaySize: number;
  radius: number;
  velocity: number;
  angularVelocity: number;
  includeOverlay: boolean;
  hasRing: boolean;
  parentId?: string;
  description: string;
  facts: BodyFact[];
};

export type BodyDetails = {
  category: string;
  description: string;
  facts: BodyFact[];
};
