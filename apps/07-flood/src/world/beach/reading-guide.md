# Beach

This folder is the beach as plain numbers. Nothing here imports the GPU. The beach view, the boats, the plane, and the helicopters read these pieces and turns.

## Why the files are split

| File            | Chapter                                                                                               |
| --------------- | ----------------------------------------------------------------------------------------------------- |
| `space.ts`      | A point, a turn, and a box. `turnAbout`, `multiply`, and `rotate` are the only maths the props share. |
| `pier.ts`       | The deck, its spans and lamps, the arch, and the promenade posts.                                     |
| `wheel.ts`      | The Ferris wheel that stands on the pier's head.                                                      |
| `lighthouse.ts` | The banded tower and `BEACON`, where the beam starts.                                                 |
| `palms.ts`      | A curved trunk, its fronds, and the row along the sand.                                               |
| `drift.ts`      | What happens after the flood tears a palm out: rooted, afloat, stranded, or gone.                     |
| `moorings.ts`   | Motor boats, sailboats, and the buoys, and where each anchor holds.                                   |
| `beach.ts`      | `createBeach` puts those parts into one value the scene keeps.                                        |

## What stays outside

Callers keep `@/world/beach`. The barrel still exports `PIER_X`, `Span`, `Lamp`, `Wheel`, `Post`, `Palm`, and `SAILBOAT`, even where nothing outside the folder imports them today.

## Roadmap

`pier.ts` still holds the neck, the T-shaped head, the arch, and the promenade lamps. Split those when that file is the next target. Nothing else in the folder is queued.
