# Spray

This folder is the spray thrown where the flood strikes walls, buildings, and the shore. Read `spray.ts` first: it owns the droplet pool and the hooks the scene calls. The other files are the chapters that hook runs.

## What the frame calls

`initAsync` compiles the pipelines once, before the first frame.

Each frame the scene calls:

1. `spawn`, once, before the fixed steps. This layer queues no CPU bursts; `throw` emits on the GPU later in the same pass.
2. `step`, once per fixed tick, for every tick of catch-up. The step does not read the real frame delta.
3. `throw`, once, after the water has moved. It carries this frame's real delta only to advance the throw clock.
4. `compact`, once, after `throw`, with how far the frame is ahead of the fixed steps, so the droplets just emitted are in the drawing.

`setDaylight` sets how much daylight lights the spray, from 1 at noon to near 0 at night. The scene calls it when the light changes, not on every tick. `clear` ends every droplet. `destroy` releases the pool. `drawing` is what the scene adds. This layer has no `update`, `prepare`, or `paint`.

## Why the files are split

| File       | Chapter                                                                                              |
| ---------- | ---------------------------------------------------------------------------------------------------- |
| `throw.ts` | Which cells throw a droplet, then `spawn`, `step`, and `compact` for the drops already in the air.   |
| `draw.ts`  | The soft white droplet the camera sees, as bright as the daylight, fading to its rim and as it ages. |

## What stays outside

Callers keep `@/spray`. The barrel still exports `createSpray`. Where a cell was struck, and the current there, stay on the water layer: `impactAt` and `currentAt`.

## Roadmap

Nothing in the folder is queued.
