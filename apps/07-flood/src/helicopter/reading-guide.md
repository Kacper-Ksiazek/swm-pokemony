# Helicopter

This folder is the rescue helicopter. Read `helicopter.ts` first: it owns the aircraft and the hooks the scene calls. The other files are the chapters that build runs.

## What the frame calls

`createHelicopter` builds one helicopter before the first frame.

Each frame the scene calls:

1. `update`, once, with the real frame delta and the centre on the ground it circles. The flight uses that delta. It does not run on the flood's fixed tick.
2. The scene draws `renderer` and `beam` with the rest of the view. This folder does not record the pass.

`setActive` sends it out over the flood, or home again. `setNight` sets how much of the searchlight is on. `destroy` releases the instances. This layer has no `step`, `paint`, or `capture`.

`renderer` and `beam` belong to the helicopter alone. They are not hooks every layer has.

## Why the files are split

| File          | Chapter                                                                                               |
| ------------- | ----------------------------------------------------------------------------------------------------- |
| `airframe.ts` | The red and white body, the main rotor, and the tail rotor, as boxes hidden until it is called out.   |
| `beam.ts`     | The searchlight's beam: a strip from the lamp to its target, turned to face the eye.                  |
| `flight.ts`   | The flight in from the hangar and around the flood, the rotor spin, and where the searchlight points. |

## What stays outside

Callers keep `@/helicopter`. The barrel still exports `createHelicopter` and `HelicopterOptions`.

`multiply`, `rotate`, and `turnAbout` stay in `@/world/beach`. The mesh pool and the point-light table belong to the scene.

## Roadmap

Nothing in the folder is queued.
