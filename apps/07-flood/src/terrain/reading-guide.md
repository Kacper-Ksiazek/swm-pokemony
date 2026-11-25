# Terrain

This folder is the ground the camera sees. Read `terrain.ts` first: it takes the height buffer the water owns and returns the mesh, the soil walls, and `destroy`. The other files are the chapters that build uses.

## What the frame calls

`createTerrain` runs once, when the scene is built. Nothing in this folder runs on a tick.

Each frame the scene draws what it returned:

1. `renderer`, the ground mesh, in the main pass and in the shadow pass.
2. `skirt`, the soil walls along the map edge, in the main pass.

`destroy` runs when the scene is torn down. It releases the instance field. This layer has no `step`, `paint`, `update`, or `capture`.

## Why the files are split

| File         | Chapter                                                                                        |
| ------------ | ---------------------------------------------------------------------------------------------- |
| `colour.ts`  | Sand, grass, the promenade, the islet, and the roads. `Ground` is the material the mesh wears. |
| `mesh.ts`    | One sample of the height buffer per cell, baked into a mesh, with normals from the neighbours. |
| `skirt.ts`   | The cut through the land along each side of the map: topsoil, clay, then rock.                 |
| `terrain.ts` | `createTerrain` wires those chapters and returns `renderer`, `skirt`, and `destroy`.           |

`heightOf` is copied in `mesh.ts` and `skirt.ts`. Each drawing has to call a shell function defined beside it, and both read the same readonly view of the height buffer.

## What stays outside

`edges.ts` builds the quads along the map border. The water draws its own cut with those same quads, so `edges.ts` stays a sibling of this folder. The import stays `@/edges`.

## Roadmap

Nothing in the folder is queued. `colour.ts` is one material, `mesh.ts` is one mesh, and `skirt.ts` is one drawing.
