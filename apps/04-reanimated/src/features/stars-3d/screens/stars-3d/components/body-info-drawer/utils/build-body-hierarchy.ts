import { SOLAR_SYSTEM_BODIES, type SolarSystemBodyInfo } from "../../../solar-system";

import type { IndexedBody } from "../body-info-drawer.types";

export type BodyHierarchy = {
  body: SolarSystemBodyInfo;
  parent: IndexedBody | null;
  siblings: IndexedBody[];
  children: IndexedBody[];
};

/** Resolves parent, siblings, and children for the selected body index in the solar catalog. */
export function buildBodyHierarchy(bodyIndex: number): BodyHierarchy | null {
  const body = SOLAR_SYSTEM_BODIES[bodyIndex];
  if (!body) {
    return null;
  }

  const indexedBodies: IndexedBody[] = SOLAR_SYSTEM_BODIES.map((candidate, index) => ({
    index,
    body: candidate,
  }));

  const parent = body.parentId
    ? (indexedBodies.find((item) => item.body.id === body.parentId) ?? null)
    : null;

  const siblings = body.parentId
    ? indexedBodies.filter((item) => item.body.parentId === body.parentId)
    : [{ index: bodyIndex, body }];

  const children = indexedBodies.filter((item) => item.body.parentId === body.id);

  return { body, parent, siblings, children };
}
