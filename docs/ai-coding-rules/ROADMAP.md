# AI coding rules roadmap

Living snapshot of what agents should know about this repo. Categories below are written. Screen UI lives in `src/features`. The tabs are List (landing), Favorite, Map, and Camera.

Output root: `docs/ai-coding-rules/`. One directory per category, one file per rule. Rules are English.

## Stack

- Expo SDK 58, Expo Router, React Native 0.88, React 19, TypeScript strict
- Entry: `expo-router/entry`. Routes live in `src/app/`
- Native tabs (`expo-router/native-tabs`) with a nested `Stack` on Screen B and Screen C
- Bun (`bun.lock`). Lint and format: Biome 2. Path alias `@/*` → `src/*`
- No test runner, no data layer, no global store, no map, no camera yet
- `ios/` and `android/` are not hand-edited (continuous native generation)

## Categories

- [x] `concept` — why the app exists, who owns the code, how AI is allowed to help. Source: `concept/project-brief.md` plus three follow-on rules.
- [x] `architecture` — thin route files, `src/features`, screen folders, public feature `index.ts`, no cross-feature imports. In the tree for List, Favorite, Map, and Camera.
- [x] `navigation` — `NativeTabs` triggers, nested stacks for headers and back, layouts stay in `src/app`. Covers `src/app/_layout.tsx`, `screen-b/_layout.tsx`, `screen-c/_layout.tsx`.
- [x] `typescript` — `strict`, `@/*` imports, named exports from features, default export only at the route boundary. Covers `tsconfig.json` and route/feature files.
- [x] `react-native` — `StyleSheet` beside the screen, strings inside `Text`. Biome skip list for `NativeTabs.Trigger.Label` and `Stack.Title` in `src/app/**`.
- [x] `tooling` — Biome (double quotes, semicolons, trailing commas, width 100), `bun run lint`, `bunx tsc --noEmit`. The assignment text mentions ESLint and Prettier; this repo uses Biome.
- [x] `expo` — read the installed SDK docs before using an Expo API, install with `npx expo install`, do not hand-edit `ios/` or `android/`, development build rather than Expo Go once native modules land.
- [x] `git` — one PR per step, several commits per PR, squash-merge, hand-written PR description, owner merges. Process rule from the brief, not from git history.

## Deferred

No rule files until the code exists:

- PokeAPI fetching, pagination, pull-to-refresh
- Favorite persistence
- Map pins
- Camera and face detection
- Tests
