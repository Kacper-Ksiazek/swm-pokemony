# Layout

This folder is the town as plain numbers. Nothing here imports the GPU. Water, terrain, cars, and the beach read these values, and the same functions can be checked on the CPU.

## Why the files are split

| File           | Chapter                                                                                     |
| -------------- | ------------------------------------------------------------------------------------------- |
| `grid.ts`      | How wide the world is, how many cells share it, and where a cell's centre sits.             |
| `town.ts`      | The coast, the promenade, the town box, the road grid, and the islet.                       |
| `ground.ts`    | Height at any point, and whether that point is a road.                                      |
| `buildings.ts` | What a building is made of, the five kinds, and which lots they stand on.                   |
| `layout.ts`    | The arrays the flood starts from: ground, calm sea, solid tops, and the owner of each cell. |

`DOWNTOWN` stays in `town.ts` and is not re-exported. Only `placeBuildings` uses it.

## What stays outside

Callers keep `@/world/layout`. The barrel still exports `SEA_EDGE`, `SHORE`, `isRoad`, `OFFICE_WINDOWS`, and `Kind`, even though no file imports them today. The terrain comment names `isRoad` as the road test it repeats on the GPU.

## Roadmap

`buildings.ts` still holds the house, the town house, the block, the tower, the hotel, and the lot placement. Split the generators when that file is the next target. Nothing else in the folder is queued.
