# Buildings

This folder is the GPU buildings layer. Read `buildings.ts` first: it owns the instance buffer and the hooks the scene calls. The other files are the chapters that hook runs.

## What the frame calls

The scene keeps `renderer` on the main pass and on the shadow pass. It writes `evening` as the day moves into dusk. The beach and the boats read that same uniform.

Each frame the scene calls:

1. `update`, once, with the falls and the simulated time. A building that is still falling leans toward the push and crumbles into a wide, low heap. One whose fall has finished is left alone.

`reset` stands every building up again when the town is drained. `destroy` releases the instances. This layer has no `step`, `prepare`, or `spawn`.

## Why the files are split

| File           | Chapter                                                                                                            |
| -------------- | ------------------------------------------------------------------------------------------------------------------ |
| `buildings.ts` | The instance buffer, and `update`, `reset`, and `destroy`.                                                         |
| `pose.ts`      | The turns a falling part takes: the lean toward the push, the gable roof, and how wide and dusty the heap grows.   |
| `draw.ts`      | The facade shader. Windows are painted in rows by storey, and at dusk some of them light up. `Evening` lives here. |

## What stays outside

`world/layout/buildings.ts` is the CPU town: the parts, the kinds, and the lots. It stays outside this folder. Callers keep `@/buildings`, which still exports `createBuildings` and `Evening`.

## Roadmap

`buildings.ts` still both places the standing parts and writes the fall. Split those when that file is the next target. Nothing else in the folder is queued.
