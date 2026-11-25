# Scene

This folder is the scene conductor. Read `scene.ts` first: it builds the town, wires the layers, and returns the object the app calls. The other files are the chapters that object runs.

`index.ts` exports `createScene`, `DUSK`, `Cinema`, and `FloodScene`.

## What the app calls

`createScene` compiles the pipelines once, before the first frame.

Each frame the app calls `frame`, and the conductor runs, in this order:

1. The clock (`seconds`), then `direct`, then the orbit `view`, the plane, the helicopters, the fireworks, and the gulls.
2. The weather, then a sky bake when the hour or the storm has changed.
3. The fixed simulation steps, the sea level at the edge, and `topple`.
4. The buildings, the walls, the shore, and the signs.
5. A clear of debris and spray on the frame after `reset`, then that flag drops.
6. `prepare`, the compute pass (spawn, one step per tick, paint, throw, compact), then `capture`.
7. The shadow pass, `scene.record`, the glow, and the final image.

`release` starts the wave. `reset` calms the sea and stands the fallen town back up. `setHour`, `setStorm`, and `setCinema` change the light, the weather, and the camera. `draft`, `build`, `markWallAt`, `removeWall`, `clearWalls`, and `wallCount` are the player's walls. `groundUnder` is the ground point under the pointer. `destroy` releases the layers.

## Why the files are split

| File          | Chapter                                                                                                                               |
| ------------- | ------------------------------------------------------------------------------------------------------------------------------------- |
| `tide.ts`     | The wave at the sea edge: the step, the pace, and the sea level as it rises, holds, and falls.                                        |
| `daylight.ts` | The hour, the storm, and the sky colours. `setHour` and `applyLight` light the town. The frame writes the storm and the bake clock.   |
| `ruins.ts`    | What the water knocks down: buildings, wall breaches, pier spans, palms, posts, and drift, and the moment the wave strikes the beach. |
| `camera.ts`   | How the camera moves: as the viewer drags it, chasing the wave, or beside the plane.                                                  |
| `walls.ts`    | The walls the player drafts, builds, and removes, and the cells they block.                                                           |
| `frame.ts`    | One frame, in the order above.                                                                                                        |
| `scene.ts`    | Builds every layer, compiles the pipelines, and returns the object the app calls.                                                     |

## What stays outside

The drawings and the simulations stay in their own folders. This conductor imports them and does not own them. The town layers stay at `@/cars`, `@/water`, `@/beach`, `@/buildings`, `@/world/layout`, `@/world/beach`, `@/world/walls`, and `@/world/collapse`. The rest (`@/boats`, `@/debris`, `@/fireworks`, `@/gulls`, `@/helicopter`, `@/plane`, `@/signs`, `@/spray`, `@/terrain`, `@/walls`, `@/weather`) stay outside the same way.

## Roadmap

One file is still over a single chapter:

- `scene.ts` wires every layer inside `createScene`: the layout, the passes, the compile, and the clock, then hands each chapter what it closes over.

Split that when this file is the next target. Nothing else in the folder is queued.
