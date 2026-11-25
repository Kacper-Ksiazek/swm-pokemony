# Debris

This folder is the rubble and dust a falling building throws. Read `debris.ts` first: it owns both particle systems and the hooks the scene calls. The other files are the two kinds of particle.

## What the frame calls

`initAsync` compiles the pipelines once, before the first frame.

Each frame the scene calls:

1. `spawn`, once, before the fixed steps, so this frame's bursts exist.
2. `step`, once per fixed tick, for every tick of catch-up. The step does not read the real frame delta.
3. `compact`, once, after those ticks.

The drawings are already in the scene, so the render pass shows them with no extra call.

`collapse` throws rubble, and dust unless the caller turns dust off, when a building, wall, or span starts to fall. `shatter` throws one glass or metal chip; cars call it from their own kernel. `setDaylight` sets how bright the dust is, from 1 at noon to near 0 at night. `clear` wipes every particle. `destroy` releases both systems.

## Why the files are split

| File        | Chapter                                                                                                    |
| ----------- | ---------------------------------------------------------------------------------------------------------- |
| `chunks.ts` | Solid chips: how they drift on the water or rest on the ground, how a chip is shaded, and the crash shard. |
| `dust.ts`   | Dust puffs: how they billow, and how a puff is shaded from one lit colour and the daylight uniform.        |

Each file keeps that system's step and its drawing together. One shader is never split across files.

## What stays outside

`Building` is the layout's record of a house. `collapse` only reads its place, size, and colour, so the type stays in `@/world/layout`. The water reads (`waterAt`, `currentAt`, `floorAt`) stay in the water layer; this folder only calls them.
