import { ISLET } from "@/world/layout";

import { PIER_X } from "./pier";

/** What floats: a motor boat, a sailing boat or a buoy. */
export const MOTORBOAT = 0;
export const SAILBOAT = 1;
export const BUOY = 2;

export type Mooring = {
  readonly kind: number;
  /** Where its anchor holds, and how far its rope lets it swing. */
  readonly anchor: readonly [number, number];
  readonly rope: number;
  readonly heading: number;
};

export function placeMoorings(random: () => number) {
  const moorings: Mooring[] = [];

  // Boats tied up along both sides of the pier's neck
  for (let z = -52; z >= -80; z -= 7) {
    for (const side of [-1, 1]) {
      if (random() < 0.25) continue;

      moorings.push({
        kind: random() < 0.6 ? MOTORBOAT : SAILBOAT,
        anchor: [PIER_X + side * 6.5, z],
        rope: 1.5,
        heading: random() * Math.PI * 2,
      });
    }
  }

  // Boats at anchor out in the bay
  for (let i = 0; i < 12; i++) {
    const x = -85 + random() * 170;

    if (Math.abs(x - PIER_X) < 14 || Math.abs(x - ISLET.x) < ISLET.radius + 8) continue;

    moorings.push({
      kind: random() < 0.5 ? MOTORBOAT : SAILBOAT,
      anchor: [x, -76 - random() * 18],
      rope: 4 + random() * 3,
      heading: random() * Math.PI * 2,
    });
  }

  // A line of buoys marking where swimmers may go, and a pair marking the pier's head
  for (let x = -84; x <= 6; x += 7.5) {
    moorings.push({ kind: BUOY, anchor: [x, -66], rope: 0.6, heading: 0 });
  }

  for (const side of [-1, 1]) {
    moorings.push({ kind: BUOY, anchor: [PIER_X + side * 13, -95], rope: 0.6, heading: 0 });
  }

  return moorings;
}
