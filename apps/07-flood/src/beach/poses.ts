import { instances, lighting, type table } from "@typegpu/kit";

import {
  IDENTITY,
  multiply,
  rotate,
  turnAbout,
  type Beach,
  type Drift,
  type Piece,
  type Quaternion,
  type Vec3,
} from "@/world/beach";
import { FALL_SECONDS, type Fall } from "@/world/collapse";

import type { BeachLit } from "./lights";

/** How far palms sway in the sea breeze, in radians, and how fast. */
const SWAY = 0.035;
const SWAY_RATE = 1.3;

/** How far a falling palm or a breaking span turns before it lies still, in radians. */
const PALM_FALL = 1.45;
const SPAN_TIP = 0.5;

/** A post knocked down lies nearly flat. */
const POST_FALL = 1.5;

/** How far a broken span sinks, in metres. */
const SPAN_SINK = 4;

/** How fast the Ferris wheel turns, in radians per second. */
const WHEEL_TURN = 0.12;

/** Something placed by a turn about a pivot, then a shift. */
type Pose = { readonly pivot: Vec3; readonly turn: Quaternion; readonly shift: Vec3 };

const ease = (time: number, since: number) => {
  const t = Math.min(Math.max((time - since) / FALL_SECONDS, 0), 1);

  return { t, p: t * t };
};

/** The horizontal axis across a direction along the ground, so turning about it tips toward it. */
const across = ([x, z]: readonly [number, number]): Vec3 => [z, 0, -x];

const place = (piece: Piece, pose: Pose) => {
  const offset = rotate(pose.turn, piece.offset);

  return {
    position: [
      pose.pivot[0] + pose.shift[0] + offset[0],
      pose.pivot[1] + pose.shift[1] + offset[1],
      pose.pivot[2] + pose.shift[2] + offset[2],
    ] as const,
    rotation: multiply(pose.turn, piece.rotation),
    scale: piece.size,
  };
};

const still = (pivot: Vec3): Pose => ({ pivot, turn: IDENTITY, shift: [0, 0, 0] });

/**
 * Places every beach piece, then each frame sways, falls, tips, and turns them. The lamp table is
 * only told which lamps have gone dark; the beams turn through `sweep`.
 */
export function createPoses(input: {
  readonly beach: Beach;
  readonly things: instances.Instances<BeachLit>;
  readonly box: Parameters<instances.Instances<BeachLit>["add"]>[0];
  readonly lamps: table.Table<typeof lighting.PointLight>;
  readonly lampRows: readonly table.RowId<typeof lighting.PointLight>[];
  readonly dark: Set<number>;
  readonly sweep: (time: number) => void;
}) {
  const { beach, things, box, lamps, lampRows, dark, sweep } = input;

  const add = (piece: Piece, pose: Pose) =>
    things.add(box, {
      ...place(piece, pose),
      color: piece.color,
      roughness: 0.8,
      glow: piece.glow,
    });

  for (const piece of beach.pieces) add(piece, still([0, 0, 0]));
  const postRows = beach.posts.map((post) =>
    post.pieces.map((piece) => add(piece, still(post.foot))),
  );
  const settledPosts = new Set<number>();
  const spanRows = beach.spans.map((span) =>
    span.pieces.map((piece) => add(piece, still(span.centre))),
  );
  const palmRows = beach.palms.map((palm) =>
    palm.pieces.map((piece) => add(piece, still(palm.foot))),
  );
  const head = beach.spans[beach.spans.length - 1];
  const { wheel } = beach;
  const turningRows = wheel.turning.map((piece) => add(piece, still(head.centre)));
  const carRows = wheel.cars.map(({ piece }) => add(piece, still(head.centre)));
  const legRows = wheel.legs.map((piece) => add(piece, still(head.centre)));

  /**
   * Turns the wheel to `spin` on the pier's head as `pose` places it. The rim and spokes turn
   * about the axle; each car hangs level from its point on the rim.
   */
  const placeWheel = (spin: number, pose: Pose, lit: boolean) => {
    const turn = turnAbout([0, 0, 1], spin);
    const onAxle = (piece: Piece, at: Vec3, rotation: Quaternion): Piece => ({
      ...piece,
      offset: [wheel.axle[0] + at[0], wheel.axle[1] + at[1], wheel.axle[2] + at[2]],
      rotation,
    });

    wheel.turning.forEach((piece, i) => {
      const moved = onAxle(piece, rotate(turn, piece.offset), multiply(turn, piece.rotation));
      things.write(turningRows[i], { ...place(moved, pose), glow: lit ? piece.glow : [0, 0, 0] });
    });

    wheel.cars.forEach(({ angle, piece }, i) => {
      const rim: Vec3 = [
        Math.cos(angle + spin) * wheel.radius,
        Math.sin(angle + spin) * wheel.radius + piece.offset[1],
        0,
      ];
      things.write(carRows[i], place(onAxle(piece, rim, piece.rotation), pose));
    });

    wheel.legs.forEach((piece, i) => things.write(legRows[i], place(piece, pose)));
  };
  things.flush();

  const settledSpans = new Set<number>();
  const settledPalms = new Set<number>();

  return {
    /**
     * Sways every standing palm in the breeze, and moves the spans and palms that are falling:
     * a span tips over and sinks under the water; a palm falls flat the way the water pushed it.
     */
    update(
      time: number,
      spanFalls: readonly (Fall | undefined)[],
      palmFalls: readonly (Fall | undefined)[],
      drift: readonly Drift[],
      postFalls: readonly (Fall | undefined)[],
    ) {
      // Lamp posts and the arch topple about their feet the way the water pushed them, and go dark
      beach.posts.forEach((post, i) => {
        const fall = postFalls[i];
        if (!fall || settledPosts.has(i)) return;

        const { t, p } = ease(time, fall.since);

        if (post.lamp !== undefined && !dark.has(post.lamp)) {
          dark.add(post.lamp);
          lamps.write(lampRows[post.lamp], { intensity: 0 });
        }

        const pose: Pose = {
          pivot: post.foot,
          turn: turnAbout(across(fall.toward), POST_FALL * p),
          shift: [0, 0, 0],
        };
        post.pieces.forEach((piece, j) =>
          things.write(postRows[i][j], { ...place(piece, pose), glow: [0, 0, 0] }),
        );
        if (t >= 1) settledPosts.add(i);
      });

      sweep(time);

      beach.palms.forEach((palm, i) => {
        const fall = palmFalls[i];
        const log = drift[i];
        if (log.mode === "gone") {
          palm.pieces.forEach((_, j) =>
            things.write(palmRows[i][j], { position: [0, -100, 0], scale: [0, 0, 0] }),
          );

          return;
        }
        if (fall && log.mode !== "rooted") {
          // Torn out: it lies along the water where the current has taken it, turning as it goes
          const lying = multiply(
            turnAbout([0, 1, 0], log.yaw),
            turnAbout(across(fall.toward), Math.PI / 2),
          );
          const pose: Pose = { pivot: [log.x, log.y, log.z], turn: lying, shift: [0, 0, 0] };
          palm.pieces.forEach((piece, j) => things.write(palmRows[i][j], place(piece, pose)));

          return;
        }
        if (settledPalms.has(i)) return;

        let turn: Quaternion;
        if (fall) {
          const { t, p } = ease(time, fall.since);
          turn = turnAbout(across(fall.toward), PALM_FALL * p);
          if (t >= 1) settledPalms.add(i);
        } else {
          const gust = Math.sin(time * 0.31 + palm.slot) * 0.5 + 0.5;
          const angle = SWAY * (0.5 + gust) * Math.sin(time * SWAY_RATE + palm.slot * 1.7);
          // The breeze comes off the sea, from -z, so the palms rock about x
          turn = turnAbout([1, 0, 0], angle);
        }
        const pose: Pose = { pivot: palm.foot, turn, shift: [0, 0, 0] };
        palm.pieces.forEach((piece, j) => things.write(palmRows[i][j], place(piece, pose)));
      });

      // The wheel rides on the pier's head: it turns while the head stands and falls with it
      const headFall = spanFalls[beach.spans.length - 1];
      if (!headFall) {
        placeWheel(time * WHEEL_TURN, still(head.centre), true);
      } else if (!settledSpans.has(beach.spans.length - 1)) {
        const { p } = ease(time, headFall.since);
        placeWheel(
          headFall.since * WHEEL_TURN,
          {
            pivot: head.centre,
            turn: turnAbout(across(headFall.toward), SPAN_TIP * p * 1.6),
            shift: [headFall.toward[0] * p * 3, -SPAN_SINK * p, headFall.toward[1] * p * 3],
          },
          false,
        );
      }

      beach.spans.forEach((span, i) => {
        const fall = spanFalls[i];
        if (!fall || settledSpans.has(i)) return;

        const { t, p } = ease(time, fall.since);

        if (!span.lamps.every((lamp) => dark.has(lamp))) {
          for (const lamp of span.lamps) {
            dark.add(lamp);
            lamps.write(lampRows[lamp], { intensity: 0 });
          }
        }

        const pose: Pose = {
          pivot: span.centre,
          turn: turnAbout(across(fall.toward), SPAN_TIP * p),
          shift: [fall.toward[0] * p * 3, -SPAN_SINK * p, fall.toward[1] * p * 3],
        };
        span.pieces.forEach((piece, j) =>
          things.write(spanRows[i][j], { ...place(piece, pose), glow: [0, 0, 0] }),
        );
        if (t >= 1) settledSpans.add(i);
      });
    },

    /** Puts the posts, palms, and spans back on their feet and forgets which lamps went dark. */
    reset() {
      settledSpans.clear();
      settledPalms.clear();
      settledPosts.clear();

      beach.posts.forEach((post, i) =>
        post.pieces.forEach((piece, j) =>
          things.write(postRows[i][j], { ...place(piece, still(post.foot)), glow: piece.glow }),
        ),
      );

      beach.palms.forEach((palm, i) =>
        palm.pieces.forEach((piece, j) =>
          things.write(palmRows[i][j], place(piece, still(palm.foot))),
        ),
      );

      dark.clear();

      beach.spans.forEach((span, i) =>
        span.pieces.forEach((piece, j) =>
          things.write(spanRows[i][j], { ...place(piece, still(span.centre)), glow: piece.glow }),
        ),
      );
    },
  };
}
