# Boats

This folder is the boats and buoys. Read `boats.ts` first: it owns the slot buffer and the hooks the scene calls. The other files are the chapters that hook runs.

## What the frame calls

`initAsync` compiles the pipeline once, before the first frame.

Each frame the scene calls:

1. `prepare`, once, before the steps. It sets the step length and the clock.
2. `step`, once per fixed 1/120 s tick, for every tick of catch-up. The step reads the length and the clock `prepare` wrote.

`reset` puts every boat and buoy back on its mooring. `destroy` releases the parts and the slot buffer. This layer has no `update`, `paint`, or `spawn`.

`renderer` is the drawing the scene adds, including the shadow pass. It belongs to boats alone.

## Why the files are split

| File      | Chapter                                                                                                          |
| --------- | ---------------------------------------------------------------------------------------------------------------- |
| `hull.ts` | The boxes a motorboat, a sailboat, or a buoy is built from, placed from the slot buffer: yaw, swell, and a list. |
| `step.ts` | One tick of every hull. A rope snaps, the hull rides or drifts or lies over, and walls and other hulls dent it.  |

The slot buffer and the sea uniform are created in `boats.ts`. The tick receives the mutable view and the drawing receives the readonly view.

## What stays outside

Callers keep `@/boats`. The barrel still exports `createBoats`. `Evening` is the town light, from `@/buildings`. Moorings, `BUOY`, and `MOTORBOAT` come from `@/world/beach`. `SPAN` is the map width, from `@/world/layout`. The height, current, floor, and ground at a point stay on the water layer; this folder only calls them.

## Roadmap

One file is still over a single chapter:

- `step.ts` holds snapping a rope, riding at anchor, drifting, running aground, bouncing off walls and hulls, holding the rope, and dropping anything that leaves the map.

Split those when that file is the next target. Nothing else in the folder is queued.
