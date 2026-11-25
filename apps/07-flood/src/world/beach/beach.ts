import { placeLighthouse } from "./lighthouse";
import { placeMoorings, type Mooring } from "./moorings";
import { placePalms, type Palm } from "./palms";
import { placePier, placePromenadeLamps, type Lamp, type Post, type Span } from "./pier";
import { type Piece } from "./space";
import { placeWheel, type Wheel } from "./wheel";

export type Beach = {
  readonly spans: readonly Span[];
  readonly lamps: readonly Lamp[];
  /** Fixed pieces that belong to nothing that falls: the lighthouse. */
  readonly pieces: readonly Piece[];
  /** The promenade's lamp posts and the arch onto the pier, which the flood can knock over. */
  readonly posts: readonly Post[];
  readonly palms: readonly Palm[];
  readonly moorings: readonly Mooring[];
  /** The Ferris wheel, which stands on the pier's head span, the last. */
  readonly wheel: Wheel;
};

export function createBeach(random: () => number): Beach {
  const pier = placePier();
  const lamps = [...pier.lamps];
  const pieces = [...pier.pieces];
  const posts: Post[] = [pier.gate];
  placePromenadeLamps(lamps, posts);
  placeLighthouse(lamps, pieces);

  return {
    spans: pier.spans,
    lamps,
    pieces,
    posts,
    palms: placePalms(random),
    moorings: placeMoorings(random),
    wheel: placeWheel(),
  };
}
