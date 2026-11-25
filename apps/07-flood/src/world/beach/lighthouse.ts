import { groundAt, ISLET, type Color } from "@/world/layout";

import { POST, type Lamp } from "./pier";
import { IDENTITY, piece, turnAbout, type Piece, type Vec3 } from "./space";

const TOWER_WHITE: Color = [0.93, 0.92, 0.88];
const TOWER_RED: Color = [0.78, 0.16, 0.12];
const LANTERN: Color = [1, 0.92, 0.7];

/** Where the lighthouse's lamp burns, and where its beams start. */
export const BEACON: Vec3 = [ISLET.x, groundAt(ISLET.x, ISLET.z) + 22.7, ISLET.z];

/**
 * A lighthouse on the islet: a tapering tower in red and white bands, a dark gallery, a glazed
 * lantern room with its lamp, and a red cap.
 */
export function placeLighthouse(lamps: Lamp[], pieces: Piece[]) {
  const foot = groundAt(ISLET.x, ISLET.z) - 0.3;
  const bands = 6;
  const band = 3.4;
  pieces.push(piece([ISLET.x, foot + 0.5, ISLET.z], [5.4, 1, 5.4], [0.55, 0.52, 0.48]));

  for (let i = 0; i < bands; i++) {
    const width = 4 - i * 0.32;
    pieces.push(
      piece(
        [ISLET.x, foot + 1 + band * (i + 0.5), ISLET.z],
        [width, band, width],
        i % 2 === 0 ? TOWER_WHITE : TOWER_RED,
        turnAbout([0, 1, 0], Math.PI / 4),
      ),
    );
  }

  const top = foot + 1 + band * bands;
  pieces.push(piece([ISLET.x, top + 0.2, ISLET.z], [3.6, 0.4, 3.6], POST));
  pieces.push(piece([ISLET.x, BEACON[1], ISLET.z], [1.8, 2.4, 1.8], LANTERN, IDENTITY, LANTERN));
  pieces.push(
    piece(
      [ISLET.x, BEACON[1] + 1.6, ISLET.z],
      [2.2, 0.8, 2.2],
      TOWER_RED,
      turnAbout([0, 1, 0], Math.PI / 4),
    ),
  );
  lamps.push({ light: [ISLET.x, BEACON[1], ISLET.z] });
}
