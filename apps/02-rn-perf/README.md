# `02_rn_perf` — React Native performance workshop

Hands-on feed app for diagnosing list performance, React re-renders, and native profiling. Originally from the App.js performance workshop; it lives in this monorepo as the second learning app.

## Monorepo layout

- **Package / scripts** — `package.json` (`02-rn-perf`), same script names as `01-rn-basics` where it matters (`typecheck`, `export:native`).
- **Routes** — `src/app/` (Expo Router).
- **UI & workshop code** — `src/components/`, `src/data/`, `src/utils/` (workshop layout; not split into `src/features` yet).
- **Lint & format** — repo root [Biome](https://biomejs.dev/): `bun run lint`.
- **Installs** — Bun workspaces: `bun install` at repo root only.

Do not add ESLint, Prettier, `package-lock.json`, or Yarn lockfiles in this app. Match [`apps/01-rn-basics/`](../01-rn-basics/) for `typecheck` and `export:native` scripts.

## Workshop scope

The workshop is split into three parts:

- **React Native DevTools and the JS profiler with AI.** Reading flame graphs, spotting wasted renders, and using the Profiler tab together with AI assistance to find which component is actually expensive.
- **List performance.** Why feeds drop frames and the fixes that take a broken list back to the device refresh rate.
- **Native performance.** Debugging on the native side and understanding the native tools and code under a React Native app.

## Requirements

- macOS for iOS; Android Studio for Android (see original workshop targets: iOS 15.1+, API 24+).
- **Bun** (same as the monorepo — see root `package.json` and CI).
- A physical device is strongly recommended. The simulator hides the exact problems this workshop is about.

## Running the app

From the **repository root**:

```bash
bun install
bun run start:02          # Metro for 02-rn-perf
bun run ios:02              # native build (Skia, Reanimated, etc.)
# or
bun run android:02
```

Or from this directory: `bun run start`, `bun run ios`, `bun run android`.

**Skia + Bun:** `@shopify/react-native-skia` needs its `postinstall` (prebuilt binaries). Root `package.json` lists it under `trustedDependencies`; after `bun install`, root `postinstall` ensures `libs/apple/ios` exists. If `pod install` still complains about Skia, from repo root:

```bash
bun install
# or once, inside the resolved skia package:
# node node_modules/@shopify/react-native-skia/scripts/install-skia.mjs
```

**Signing:** `app.json` uses `com.anonymous.rn-perf-workshop` (monorepo default, jak `01-rn-basics`). Nie ma obcego `appleTeamId` z repo workshopu — Xcode podpina Twój Apple Developer team przy pierwszym buildzie na urządzeniu.

First native run (clean prebuild after native config or bundle ID changes):

```bash
cd apps/02-rn-perf
bunx expo prebuild --clean && bunx expo run:ios --device
```

`--clean` wipes stale `ios/` and `android/` so prebuild matches `app.json`. Re-run when switching branches that change native config.

Verify like CI:

```bash
bun run lint && bun run typecheck && bun run export:native
```

(from repo root — runs **all** workspace apps.)

## Workshop tasks (Notion board)

https://honey-digit-2bf.notion.site/18208897bf51461a841214b5f8f9156f?v=515a5db545604338bf6fbab6c30bac69

## Slides from workshops

- [React re-renders and DevTools](<slides/AppJS - React and DevTools.pptx>)
- [Native performance and memory profiling](<slides/AppJS - Native perf and memory (shareable).pptx>)

## Exercise checkpoints

- React re-renders and DevTools — `react-and-devtools-X.X`
- List performance — `list-performance-XX`
- Native performance and memory profiling — `native-performance-XX`
