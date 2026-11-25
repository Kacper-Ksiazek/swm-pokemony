# Plane

This folder is the plane that circles the town towing a banner. Read `plane.ts` first: it owns the flight uniform and the value the scene keeps. The other files are the chapters that build that value.

## What the frame calls

`createPlane` runs once, when the scene is built.

Each frame the scene calls:

1. `update`, once, with the real frame delta. It advances the ellipse, banks the airframe, spins the propeller, and lays the tow line out to the banner.

The scene draws `renderer` in the main pass and in the shadow pass, then `cloth` and `letters` in that order so the words blend over the cloth. `position` is where the plane is, which the camera reads when it flies alongside. `destroy` releases the instances and the text. This layer has no `step`, `paint`, or `capture`.

## Why the files are split

| File          | Chapter                                                                                                                                     |
| ------------- | ------------------------------------------------------------------------------------------------------------------------------------------- |
| `airframe.ts` | The high-wing boxes, the propeller, and the tow-line slot. They share one instance buffer.                                                  |
| `banner.ts`   | The cloth grid, lit from both sides, and the letters laid on both faces.                                                                    |
| `flight.ts`   | The ellipse, the bank, and where the plane and the tow line are this frame. The banner's size in metres lives here, shared with the shader. |
| `plane.ts`    | `createPlane` wires those chapters and returns `cloth`, `letters`, `update`, `renderer`, `position`, and `destroy`.                         |

The flight uniform is created in `plane.ts` and passed to the cloth and to the update. `createUniform` already returns the uniform view.

## What stays outside

Callers keep `@/plane`. The barrel still exports `createPlane`. The beach turns (`turnAbout`, `multiply`, `rotate`) stay in `@/world/beach`.

## Roadmap

`banner.ts` still holds the cloth grid and the letter placement. Split those when that file is the next target. Nothing else in the folder is queued.
