# Water

This folder is the water layer. Read `water.ts` first: it owns the cell buffers and the hooks the scene calls. The other files are the chapters that hook runs.

## What the frame calls

`initAsync` compiles the pipelines once, before the first frame.

Each frame the scene calls:

1. `step`, once per fixed 1/120 s tick, for every tick of catch-up. The step does not read the real frame delta.
2. `paint`, once, after those ticks. It carries foam, writes the surface picture, adds the push on buildings and walls, and writes the watched points.
3. `capture`, after the compute pass ends, so the push and the watched points can arrive on the CPU.

`watch` sets the points (the pier, the palms, the posts). `reset` returns the calm sea. `destroy` releases the buffers. This layer has no `update`, `prepare`, or `spawn`.

`paint`, `watch`, `capture`, `reowner`, and `rebuild` belong to water alone. They are not hooks every layer has.

## Why the files are split

| File         | Chapter                                                                                                                                       |
| ------------ | --------------------------------------------------------------------------------------------------------------------------------------------- |
| `grid.ts`    | Which cell a column and row name, and the limits the kernels share: gravity, the dry depth, the workgroup size, how often the CPU reads back. |
| `step.ts`    | One virtual-pipes tick. Two flux copies, so a cell never reads a neighbour mid-write.                                                         |
| `picture.ts` | Foam carried by the current, then the texture of height, depth, speed, and foam.                                                              |
| `sample.ts`  | `waterAt`, `currentAt`, `floorAt`, `groundAt`, and `impactAt`. Boats, cars, debris, and spray call these from their own shaders.              |
| `push.ts`    | Force of wet cells on the building or wall beside them, read back in kilonewtons.                                                             |
| `sensors.ts` | The water at up to 64 points, for the spans, palms, and posts.                                                                                |
| `draw.ts`    | The surface the camera sees, including wind waves, and the silty cut along the map edge.                                                      |

## What stays outside

`edges.ts` builds the quads along the map border. The terrain uses it too, so it stays a sibling of this folder. `Sim`, the uniform of step length and sea level, used to be exported and nothing else imported it. It now lives in `grid.ts`.

## Roadmap

Two files are still over a single chapter:

- `draw.ts` holds both drawings: the surface shader and the edge cut.
- `picture.ts` holds both kernels that run once a frame: carrying the foam, and writing the surface texture.

Split those when either file is the next target. Nothing else in the folder is queued.
