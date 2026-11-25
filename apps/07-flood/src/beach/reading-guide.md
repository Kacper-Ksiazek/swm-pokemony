# Beach

This folder is the beach the camera sees. Read `beach.ts` first: it owns the instances and the hooks the scene calls. The other files are the chapters that hook runs.

## What the frame calls

`createBeachView` builds the pier, the palms, the wheel, the lamps, and the lighthouse beams once, before the first frame.

Each frame the scene calls:

1. `setNight`, when the sky is applied. It lights the lamps and the beams for how dark it is, from 0 by day to 1 at night.
2. `update`, once, after the flood has stepped. It sways standing palms, tips spans, falls palms and posts, and turns the wheel. It takes the simulated time, not the frame delta.

`reset` stands the pier and the palms up again and lights every lamp. `destroy` releases the instances. `renderer` is the solid beach, including its shadow. `beams` is a later drawing, so the beams only add light over whatever is already there.

## Why the files are split

| File        | Chapter                                                                                                                          |
| ----------- | -------------------------------------------------------------------------------------------------------------------------------- |
| `poses.ts`  | Sway, fall, span tip, and the wheel turn. A pose is a pivot, a turn, and a shift, figured on the CPU and written onto instances. |
| `lights.ts` | Lamp point lights, and the two lighthouse beams that sweep from the lamp. The piece material glows with the evening here too.    |
| `beach.ts`  | Builds the instances and returns what the scene keeps: `renderer`, `beams`, `setNight`, `update`, `reset`, and `destroy`.        |

## What stays outside

`@/world/beach` is the CPU numbers this view reads: the pieces, the spans, the palms, the wheel, and `BEACON`. That folder never imports the GPU. This view does not change those numbers. It poses them and draws them. Callers keep `@/beach`.

## Roadmap

Two files are still over a single chapter:

- `poses.ts` holds every pose: post fall, palm sway and drift, the wheel turn, and span tip.
- `lights.ts` holds both drawings: the lamp rig and the lighthouse beams.

Split those when either file is the next target. Nothing else in the folder is queued.
