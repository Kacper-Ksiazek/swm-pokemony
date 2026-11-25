# Cars

This folder is the cars the frame drives along the roads, and that the flood picks up. Read `cars.ts` first: it owns the car buffer and the hooks the scene calls. The other files are the chapters that hook runs.

## What the frame calls

`initAsync` compiles the pipeline once, before the first frame.

Each frame the scene calls:

1. `prepare`, once, before the steps. It sets the step length and whether new cars may enter.
2. `step`, once per fixed tick, for every tick of catch-up. The step reads the length `prepare` wrote.

`reset` clears the roads; new cars drive in over the next seconds. `destroy` releases the mesh and the buffer. This layer has no `update`, `paint`, or `spawn`.

`renderer` is the drawing the scene adds, including the shadow pass. It belongs to cars alone.

## Why the files are split

| File      | Chapter                                                                                                     |
| --------- | ----------------------------------------------------------------------------------------------------------- |
| `mesh.ts` | Two boxes per car, a body and a cabin, placed from the car buffer: yaw, a bob and a roll while it floats.   |
| `step.ts` | One step of every car: lanes, junctions, the gap ahead, then the water lifting, spinning and carrying them. |

## What stays outside

Callers keep `@/cars`. The road positions, the block length, and the map span stay in `@/world/layout`. The water samples and the glass shatter stay with the water and the debris; this folder only calls them.

## Roadmap

One file is still over a single chapter:

- `step.ts` holds sending a car onto a dry road, choosing the next road, the gap it keeps, how cars shove each other, the dent a hit leaves, and the kernel that drives, floats, and wrecks them.

Split those when that file is the next target. Nothing else in the folder is queued.
