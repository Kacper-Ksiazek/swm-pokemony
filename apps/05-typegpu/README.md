# `05_typegpu` — 3D life-path board game

Expo SDK 58 app for the **TypeGPU** track. It renders a 3D board for a life-path board game (spinner, branching roads, stop tiles) with **three.js on WebGPU**. Shaders are written in TypeScript with **TypeGPU** and plugged into three's materials through **`@typegpu/three`**. The app runs in **portrait only**, and all player-facing text is **Polish** (setup, tile labels, route titles, player panel, modals). Code identifiers stay English.

## Stack

| Package                                             | Role                                                                                  |
| --------------------------------------------------- | ------------------------------------------------------------------------------------- |
| `react-native-webgpu`                               | WebGPU for React Native (Dawn). Gives `<Canvas>`, `useDevice`, `context.present()`    |
| `three` (`/webgpu`)                                 | `WebGPURenderer`, scene graph, node materials                                         |
| `typegpu`                                           | Typed WebGPU + `"use gpu"` TypeScript shaders                                         |
| `@typegpu/three`                                    | `toTSL(fn)` turns a `"use gpu"` function into a three TSL node (`material.colorNode`) |
| `unplugin-typegpu`                                  | Babel plugin (`babel.config.js`) that compiles `"use gpu"` functions                  |
| `@typegpu/gl`                                       | Peer of `@typegpu/three`                                                              |
| `react-native-reanimated` / `react-native-worklets` | Peers of `react-native-webgpu`; Reanimated also spins the wheel in the turn modal     |
| `react-native-gesture-handler`                      | Orbit, pinch-zoom and twist gestures on the board                                     |
| `zustand`                                           | Game state store (players, turn, movement)                                            |

Config worth knowing:

- `app.json`: `orientation: "portrait"`, `expo-screen-orientation` with `initialOrientation: "PORTRAIT_UP"`, and the `react-native-webgpu` config plugin (turns off Metal API validation on iOS, raises Android `minSdkVersion` to 26).
- `metro.config.js`: resolves bare `three` to `build/three.webgpu.js`, so addons and our code share one three build.
- `src/types/webgpu.d.ts`: pulls in the global WebGPU types.

Expo Go does not work. Use the dev build (`bun run ios:05`).

## Game flow

1. `/` — how many players (1–4).
2. `/setup/[player]` — once per player: name and vehicle (auto, kamper, motocykl, autobus). Each seat has its own color.
3. `/game` — the board on top, the current player's panel below (queue, field, route, last spin, tiles to the finish) and the **Zakręć kołem** button.

A turn: the wheel spins in the turn modal (1–10) → **Ruszaj** → the vehicle drives tile by tile while the camera follows it → at a fork the modal asks which route → it stops early on any stop tile → the modal shows the field it landed on → **Dalej** passes the turn. The game ends when everyone reaches **Emerytura**.

On the board: one-finger drag orbits the camera, pinch zooms, two-finger twist turns the board. **Cała plansza** / **Pokaż gracza** switches between the overview and following the current pawn; every new turn zooms back in on the player.

## Game content and rules

Everything that happens on a tile is data in `src/features/game/content/`, run by one engine in `src/features/game/engine/`. Adding a card or event is one entry, no new code.

| File                      | What                                                                                                                                                                     |
| ------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------ |
| `content/effects.ts`      | The effect vocabulary: money, salary, children, pets, move forward, extra spin, skip a turn, and target effects (take from / give to / swap with / block another player) |
| `content/action-cards.ts` | Deck for "Karta akcji" tiles (each card has `copies`; reshuffled when empty)                                                                                             |
| `content/life-events.ts`  | Events for "Wydarzenie" tiles, filtered by the route's region, plus midlife events                                                                                       |
| `content/careers.ts`      | Careers and salaries; `requiresDegree` ones unlock after "Obrona dyplomu"                                                                                                |
| `content/houses.ts`       | Houses: price now, value at the end                                                                                                                                      |
| `content/rules.ts`        | Numbers: starting money, tuition, gifts, retirement bonuses, points per child and pet                                                                                    |

Rules in short:

- Everyone starts with 10 000 zł and no job. **Kariera** tiles (and **Immatrykulacja**) are mandatory stops, like **STOP** tiles.
- **Wypłata** pays your salary when you land on it **or drive past it**; **Premia** pays double.
- Studies cost tuition but unlock better careers; both roads end up close in simulations.
- Houses can be bought on credit (the account may go negative). Buying a second house sells the first at its value.
- Target cards ask which player to hit. A player who loses a turn is skipped once.
- At **Emerytura** the finishing order adds a bonus. Final score = account + house value + 25 000 zł per child + 10 000 zł per pet.

The engine (`engine/resolve-landing.ts`, `engine/apply-effects.ts`) is pure functions over `EngineState`, so it can be played headless: 300 automated games all finish, in about 50 turns on average.

## Layout

```text
src/app/                                  thin routes: index, setup/[player], game
src/features/game/
  index.ts                                exports the three screens
  blueprint/                              board data, no rendering
    board-routes.ts                       hand-written routes (control points + special tiles)
    junction-lanes.ts                     side-by-side lanes at forks and merges (the "Y" splits)
    build-board.ts                        routes → linked tile graph (BOARD)
  store/
    game-store.ts                         Zustand store: setup, turn status, movement actions
    game-rules.ts                         spin roll, one-step movement rule, steps to the finish
  content/                                cards, events, careers, houses, rule numbers (data only)
  engine/                                 apply effects, resolve landing, scoring (pure functions)
  vehicles.ts                             vehicle list and player colors
  screens/setup-players/                  player count
  screens/setup-player/                   name + vehicle
  screens/game/
    game-screen.tsx                       canvas + gestures + panel + modal
    hooks/use-board-renderer.ts           device → WebGPURenderer → render loop + present()
    hooks/use-board-gestures.ts           pan / pinch / rotation → camera rig
    hooks/use-turn-runner.ts              moves the pawn one tile per tick
    components/player-panel.tsx           current player's details + spin button
    components/turn-modal/                spin wheel, branch choice, landing, game over
    scene/
      create-board-scene.ts               board, road mesh, stop signs, spinner, pawns, lights
      camera-rig.ts                       orbit camera: follow a pawn or show the whole board
      pawn-layer.ts                       vehicles on tiles, smooth driving between tiles
      vehicle-meshes.ts                   low-poly vehicles from boxes and cylinders
      tile-geometry.ts                    road mesh: each tile is a slab cut halfway to its neighbours
      terrain-field.ts                    bakes distance-to-road into a texture (islands vs water)
      materials/*.ts                      TypeGPU shaders: terrain, tile, spinner, noise
```

## Board blueprint

The board is plain data. `board-routes.ts` lists routes as control points with a kind pattern and some special tiles. `buildBoard` joins the points with a smooth Catmull-Rom curve, spreads tiles one unit apart along it, and links them through `next`:

```text
start ─┬─ college ─┐
       └─ career ──┴─ main ─┬─ family ────┐
                            └─ adventure ─┴─ golden ── retire
```

Tile definitions (where each field goes, its kind, and its Polish `label`) live in `board-routes.ts`; tile-kind names and colors live in `screens/game/scene/tile-palette.ts`.

Each `BoardTile` has an `id` (`main-12`), `kind`, `region`, optional `label`, a `position` on the table (`x`, `z`), a travel `heading`, and `next` tile ids. A tile with two `next` ids is a fork. At every fork and merge `junction-lanes.ts` adds two parallel lane tiles per branch next to the junction tile, so the road splits and joins like a "Y" instead of branches leaving at sharp angles. Keep a route's own first and last control points a little away from the junction; the lanes fill the gap. The scene and the game rules (`store/game-rules.ts`) read the same graph.

## Run

```bash
bun run start:05
bun run ios:05
```

Bundle id: `com.anonymous.typegpu05`.
