import { cameras, text } from "@typegpu/kit";
import { d, type TgpuRoot } from "typegpu";

import type { Sans } from "@/fonts";
import type { Fall } from "@/world/collapse";
import type { Building } from "@/world/layout";

/** Names the beachfront hotels carry on their crowns. */
const NAMES = [
  "FLAMINGO",
  "PARADISE",
  "SUNSET",
  "CORAL",
  "AZURE",
  "MARLIN",
  "TROPICANA",
  "BREEZE",
  "OCEANIC",
  "PALMS",
  "SEASIDE",
  "LAGUNA",
  "DELUXE",
  "MIRAGE",
  "ORCHID",
  "HORIZON",
];
const LONGEST = Math.max(...NAMES.map((name) => name.length));

/** Neon tubes by night, alternating pink and cyan, and the painted letters they are by day. */
const NEON = [
  [4.2, 0.7, 2.4],
  [0.6, 3.4, 4.2],
] as const;
const PAINT = [
  [0.85, 0.3, 0.55],
  [0.2, 0.6, 0.75],
] as const;

/** How tall a letter stands, in metres. */
const LETTER = 1.35;

/**
 * Hotel names on the beachfront, lettered across each hotel's crown facing the sea: painted by
 * day, glowing neon by night, dark once the hotel has fallen.
 */
export function createSigns(root: TgpuRoot, sans: Sans, buildings: readonly Building[]) {
  const hotels = buildings
    .map((building, index) => ({ building, index }))
    .filter(({ building }) => building.kind === "hotel");

  /** Letters stand upright on the seaward face: across the label is along -x seen from the sea. */
  const onCrown = (position: d.v3f, offset: d.v2f) => {
    "use gpu";
    return cameras.toClip(position + d.vec3f(-offset.x, offset.y, 0));
  };

  const signs = text.create(root, sans, {
    capacity: Math.max(hotels.length, 1),
    length: LONGEST,
    place: onCrown,
    label: "hotel signs",
  });
  hotels.forEach(({ building }, i) => {
    signs.write(i, NAMES[i % NAMES.length], { em: LETTER });
    const crown = building.parts[2];
    signs.labels.patch({
      [i]: {
        position: [
          building.x + crown.x,
          building.base + crown.y,
          building.z + crown.z - crown.depth / 2 - 0.06,
        ],
      },
    });
  });

  let night = 0;
  const fallen = new Set<number>();

  const paint = () => {
    const colors: Record<number, { color: [number, number, number, number] }> = {};
    hotels.forEach(({ index }, i) => {
      const neon = NEON[i % 2];
      const day = PAINT[i % 2];
      colors[i] = {
        color: fallen.has(index)
          ? [0, 0, 0, 0]
          : [
              day[0] + (neon[0] - day[0]) * night,
              day[1] + (neon[1] - day[1]) * night,
              day[2] + (neon[2] - day[2]) * night,
              1,
            ],
      };
    });
    signs.labels.patch(colors);
  };
  paint();

  return {
    drawing: signs.drawing,

    /** Lights the neon for how dark it is, from 0 by day to 1 at night. */
    setNight(amount: number) {
      night = amount;
      paint();
    },

    /** Puts out the signs of hotels that have started to fall. */
    update(falls: readonly (Fall | undefined)[]) {
      let changed = false;
      for (const { index } of hotels) {
        if (falls[index] && !fallen.has(index)) {
          fallen.add(index);
          changed = true;
        }
      }
      if (changed) paint();
    },

    reset() {
      fallen.clear();
      paint();
    },

    destroy() {
      signs.destroy();
    },
  };
}
