import type { Color } from "@/world/layout";

import { NEON_CYAN, NEON_PINK, POST, RAIL } from "./pier";
import { piece, turnAbout, type Piece, type Vec3 } from "./space";

/** The wheel on the pier's head: its axle above the deck, its radius, and how many cars. */
const WHEEL_AXLE: Vec3 = [0, 10, -1];
const WHEEL_RADIUS = 8;
const WHEEL_CARS = 10;
const WHEEL_RIM = 24;

export type Wheel = {
  /** The axle, relative to the centre of the pier's head. */
  readonly axle: Vec3;
  readonly radius: number;
  /** Pieces that turn with the wheel, about the axle, which runs along z. */
  readonly turning: readonly Piece[];
  /** Cars that hang level from the rim, by their angle around it. */
  readonly cars: readonly { readonly angle: number; readonly piece: Piece }[];
  /** The legs that hold the axle up. */
  readonly legs: readonly Piece[];
};

/** A Ferris wheel facing the shore, its rim lit in alternating pink and cyan neon. */
export function placeWheel(): Wheel {
  const turning: Piece[] = [];
  const segment = (2 * Math.PI * WHEEL_RADIUS) / WHEEL_RIM;

  for (let i = 0; i < WHEEL_RIM; i++) {
    const angle = (i / WHEEL_RIM) * Math.PI * 2;
    const at: Vec3 = [Math.cos(angle) * WHEEL_RADIUS, Math.sin(angle) * WHEEL_RADIUS, 0];
    const neon = i % 2 === 0 ? NEON_PINK : NEON_CYAN;
    turning.push(piece(at, [0.35, segment + 0.1, 0.35], RAIL, turnAbout([0, 0, 1], angle), neon));
  }

  for (let i = 0; i < WHEEL_CARS; i++) {
    const angle = (i / WHEEL_CARS) * Math.PI * 2;
    const half = WHEEL_RADIUS / 2;
    turning.push(
      piece(
        [Math.cos(angle) * half, Math.sin(angle) * half, 0],
        [0.12, WHEEL_RADIUS, 0.12],
        RAIL,
        turnAbout([0, 0, 1], angle - Math.PI / 2),
      ),
    );
  }

  turning.push(piece([0, 0, 0], [1, 1, 1.2], POST));
  const colors: Color[] = [NEON_PINK, NEON_CYAN, [1, 0.8, 0.3], RAIL];
  const cars = Array.from({ length: WHEEL_CARS }, (_, i) => ({
    angle: (i / WHEEL_CARS) * Math.PI * 2,
    piece: piece([0, -0.9, 0], [1.4, 1.2, 1.2], colors[i % colors.length]),
  }));
  const legs: Piece[] = [];

  for (const side of [-1, 1]) {
    for (const lean of [-1, 1]) {
      const height = WHEEL_AXLE[1];
      legs.push(
        piece(
          [lean * 2.2, height / 2, WHEEL_AXLE[2] + side * 1.1],
          [0.3, height / Math.cos(0.42), 0.3],
          RAIL,
          turnAbout([0, 0, 1], lean * 0.42),
        ),
      );
    }
  }

  return { axle: WHEEL_AXLE, radius: WHEEL_RADIUS, turning, cars, legs };
}
