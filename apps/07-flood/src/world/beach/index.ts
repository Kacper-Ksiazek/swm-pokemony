/**
 * The beach as plain numbers: the pier and its spans, the lamps, the palms, where boats lie at
 * anchor and the line of buoys. No GPU imports.
 */
export { createDrift, type Drift } from "./drift";
export { BEACON } from "./lighthouse";
export { BUOY, MOTORBOAT, SAILBOAT, type Mooring } from "./moorings";
export { type Palm } from "./palms";
export { DECK, LAMP_LIGHT, PIER_X, type Lamp, type Post, type Span } from "./pier";
export {
  IDENTITY,
  multiply,
  rotate,
  turnAbout,
  type Piece,
  type Quaternion,
  type Vec3,
} from "./space";
export { type Wheel } from "./wheel";
export { createBeach, type Beach } from "./beach";
