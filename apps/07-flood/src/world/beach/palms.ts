import { groundAt, PROMENADE, type Color } from "@/world/layout";

import { PIER_X } from "./pier";
import { multiply, piece, rotate, turnAbout, type Piece, type Vec3 } from "./space";

export type Palm = {
  readonly slot: number;
  /** The foot of the trunk, which the palm sways and falls about. */
  readonly foot: Vec3;
  readonly height: number;
  readonly pieces: readonly Piece[];
};

const BARK: Color = [0.42, 0.34, 0.26];
const LEAVES: readonly Color[] = [
  [0.16, 0.42, 0.14],
  [0.22, 0.48, 0.16],
  [0.14, 0.36, 0.12],
];
const NUTS: Color = [0.35, 0.24, 0.12];

/** A trunk that curves as it rises, crowned with drooping fronds. */
function palmPieces(height: number, lean: number, heading: number, random: () => number): Piece[] {
  const pieces: Piece[] = [];
  const segments = 7;
  const step = height / segments;
  const yaw = turnAbout([0, 1, 0], heading);
  let point: Vec3 = [0, 0, 0];
  let tilt = 0;

  for (let i = 0; i < segments; i++) {
    // The trunk bends more toward the top, as a palm does that has grown toward the light
    tilt = lean * ((i + 1) / segments) ** 1.5;
    const turn = multiply(yaw, turnAbout([1, 0, 0], tilt));
    const half = rotate(turn, [0, step / 2, 0]);
    const centre: Vec3 = [point[0] + half[0], point[1] + half[1], point[2] + half[2]];
    const width = 0.5 - (0.2 * i) / segments;
    pieces.push(piece(centre, [width, step * 1.05, width], BARK, turn));
    point = [centre[0] + half[0], centre[1] + half[1], centre[2] + half[2]];
  }

  const fronds = 8;
  const color = LEAVES[Math.floor(random() * LEAVES.length)];

  for (let i = 0; i < fronds; i++) {
    const around = (i / fronds) * Math.PI * 2 + random() * 0.4;
    const droop = 0.35 + random() * 0.45;
    const length = 3 + random() * 1.2;
    const turn = multiply(turnAbout([0, 1, 0], around), turnAbout([1, 0, 0], Math.PI / 2 + droop));
    const reach = rotate(turn, [0, length / 2, 0]);
    pieces.push(
      piece(
        [point[0] + reach[0], point[1] + reach[1], point[2] + reach[2]],
        [0.9, length, 0.06],
        color,
        turn,
      ),
    );
  }

  pieces.push(piece([point[0], point[1] - 0.35, point[2]], [0.6, 0.5, 0.6], NUTS));

  return pieces;
}

export function placePalms(random: () => number) {
  const palms: Palm[] = [];

  for (let x = -92; x <= 92; x += 7 + random() * 5) {
    if (Math.abs(x - PIER_X) < 6) continue;

    const z = PROMENADE.near - 2.5 - random() * 6;
    const height = 7 + random() * 4;
    const lean = 0.12 + random() * 0.3;
    // Palms on a beach lean out toward the sea, -z, give or take
    const heading = Math.PI + (random() - 0.5) * 1.6;
    palms.push({
      slot: palms.length,
      foot: [x, groundAt(x, z) - 0.1, z],
      height,
      pieces: palmPieces(height, lean, heading, random),
    });
  }

  return palms;
}
