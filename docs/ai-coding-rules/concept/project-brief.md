# Project brief

A learning app: a Pokémon client on [PokeAPI](https://pokeapi.co), built to understand how React Native works. It is a hobby / training project, not a commercial product. The person who owns the repo writes and explains the code; AI supports that, it does not replace it.

## Product

The finished app has four tabs:

1. **Favorite Pokémon** — one favorite at a time, stored on device, survives restart.
2. **Pokémon list** — PokeAPI list with infinite scroll and pull-to-refresh. A second screen shows one Pokémon (image and basic data) and supports back navigation.
3. **Map** — fullscreen map. A long press drops a pin with a Pokémon. A tap opens a bottom sheet with basic data and remove. Pins survive restart.
4. **Camera** — `react-native-vision-camera`, face detection places the favorite Pokémon on the forehead. Bonus: capture a photo and save it to the gallery.

UX should be clear and polished. Animations and extra ideas are welcome when they are discussed first.

## How to work

- Discuss approaches and trade-offs before writing code. The owner should understand the mechanism first.
- Land work in small increments: several commits inside a pull request, one PR per assignment step, squash-merge so `main` has one commit per step. PR descriptions are written by hand.
- The owner merges their own PRs. Anything in the repo should be explainable by them.
- A mentor is available to talk decisions through. Navigation library and the exact details fields are mentor calls; this repo already uses Expo Router.

## Current code

The app is an Expo SDK 58 + TypeScript project (React Native 0.88, Expo Router, Bun, Biome). Lint and format are Biome (`lint`, `lint:fix`, `format`), not ESLint + Prettier.

Routes stay in `src/app`; screen UI lives in `src/features`. The tab bar has four tabs. List is the landing tab (route group `(pokemon-list)`, URL `/`):

| Feature | Tab title | Route |
|---|---|---|
| `pokemon-list` | List | `(pokemon-list)` |
| `pokemon-favorite` | Favorite | `pokemon-favorite` |
| `pokemon-map` | Map | `pokemon-map` |
| `camera` | Camera | `camera` |

Favorite, Map, and Camera are placeholders. The list already loads PokeAPI.

## Structure

- `src/app` holds navigators and thin re-exports only.
- `src/features/<feature>/screens/<screen>/` owns each screen. The screen folder is the place for that screen's components and hooks.
- A feature exposes screens through its `index.ts`. Route files default-export those screens. Features do not import each other.
