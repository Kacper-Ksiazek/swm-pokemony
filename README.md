# React Native learning apps

Small Expo apps built step by step to learn React Native. Each project gets a showcase block below: screenshots, a YouTube demo, and the libraries worth studying.

---

## `01_rn_basics` — Pokédex-style client

A hobby training app that talks to [PokeAPI](https://pokeapi.co) and grows through four native tabs. The list paginates and drills into detail; favorite and map pins persist in SQLite on device. The camera tab uses face detection to stick your favorite Pokémon on screen and save a composed photo.

<br />

<div align="center">
  <p>
    <img src="https://img.shields.io/badge/YouTube-Watch_the_demo-FF0000?style=for-the-badge&logo=youtube&logoColor=white" alt="Watch the demo on YouTube" />
  </p>
  <p>
    <strong><a href="https://www.youtube.com/shorts/C_FTkzZ7Y3o">▶ youtube.com/shorts/C_FTkzZ7Y3o</a></strong>
  </p>
</div>

<br />

<p align="center">
  <img src="docs/readme-assets/01-rn-basics/screenshots/list.png" width="200" alt="List tab" />
  <img src="docs/readme-assets/01-rn-basics/screenshots/detail.png" width="200" alt="Detail screen" />
  <img src="docs/readme-assets/01-rn-basics/screenshots/detail-stats.png" width="200" alt="Detail stats" />
</p>
<p align="center">
  <img src="docs/readme-assets/01-rn-basics/screenshots/favorite.png" width="200" alt="Favorite tab" />
  <img src="docs/readme-assets/01-rn-basics/screenshots/map.png" width="200" alt="Map tab" />
  <img src="docs/readme-assets/01-rn-basics/screenshots/camera.jpg" width="200" alt="Camera tab" />
</p>

**Stack highlights**

- [Expo Router](https://docs.expo.dev/router/introduction/) — file routes, [native tabs](https://docs.expo.dev/router/advanced/native-tabs/), nested stacks for list → detail
- [expo-sqlite](https://docs.expo.dev/versions/latest/sdk/sqlite/) + [Drizzle ORM](https://orm.drizzle.team/) — favorites and map pins with migrations
- [expo-maps](https://docs.expo.dev/versions/latest/sdk/maps/) — fullscreen map, annotations, bottom sheets for pin UX
- [react-native-vision-camera](https://react-native-vision-camera.com/) — camera preview, face-guided sticker placement (iOS)
- [react-native-view-shot](https://github.com/gre/react-native-view-shot) + [expo-media-library](https://docs.expo.dev/versions/latest/sdk/media-library/) — capture composed shots to the gallery
- [react-native-reanimated](https://docs.swmansion.com/react-native-reanimated/) — animations and worklets (React Compiler–friendly patterns)
- [expo-image](https://docs.expo.dev/versions/latest/sdk/image/) + [react-native-nitro-image](https://github.com/mrousavy/nitro/tree/main/packages/react-native-nitro-image) — fast Pokémon artwork loading
- [Biome](https://biomejs.dev/) + [Bun](https://bun.sh/) — lint, format, and installs in this repo

---

## `02_rn_perf` — feed performance workshop

A mock social feed (home, post detail, threaded comments) used to practice **JavaScript-side** React Native performance. Each exercise starts from a profiler-visible bottleneck—parent re-renders, blocking first paint, or heavy list rows—and lands a fix you can re-measure on the same workflow in React Native DevTools (Profiler and Performance tabs). Hermes, React 19, Expo SDK 58; frame budget is **16 ms** at 60 fps.

<br />

<div align="center">
  <p>
    <img src="https://img.shields.io/badge/Measured_wins-Full_JS_walkthrough-3178C6?style=for-the-badge&logo=react&logoColor=white" alt="Read the full JS performance walkthrough" />
  </p>
  <p>
    <strong><a href="docs/readme-assets/02-rn-perf/pokemon-4_0-performance-js-summary.md">▶ JS performance summary (exercises 1–4)</a></strong>
  </p>
</div>

<br />

| Exercise | What changed | Before → after |
|----------|--------------|----------------|
| 1 | Like/bookmark in `PostDetailEngagement` | Whole `./post/[id]` ~74 ms → **2.2 ms** on the control (~33×) |
| 2 | Split `PostDetailScreen`, isolated `CommentInput`, theme in root layout | `VirtualizedList` commit **262 ms → 17 ms** (~15×) |
| 2.3 | React Compiler on the feed | Heaviest like commit **~204 ms → ~52 ms** (~4×) |
| 3 | `Activity` + `startTransition` for related posts | Footer off the first interactive paint |
| 3.2 | Deferred mock feed hydration + compiler | First Home commit **~197 ms → ~56 ms** (~3.5×) |
| 4 | `FeedImage` (`expo-image`), `IconSymbol`, tighter `FlatList` window | Less decode/layout work per row (−528 / +91 lines in the measured diff) |

<p align="center">
  <img src="docs/assets/02-rn-perf/exercise-2-3-before.png" width="320" alt="Feed like — profiler before React Compiler" />
  <img src="docs/assets/02-rn-perf/exercise-2-3-after.png" width="320" alt="Feed like — profiler after React Compiler" />
</p>
<p align="center">
  <img src="docs/assets/02-rn-perf/exercise-3-2-before.png" width="320" alt="Home first paint — before deferred hydration" />
  <img src="docs/assets/02-rn-perf/exercise-3-2-after.png" width="320" alt="Home first paint — after deferred hydration" />
</p>

**Stack highlights**

- [React Compiler](https://react.dev/learn/react-compiler) — `experiments.reactCompiler: true` in Expo; fewer manual `memo()` passes on the feed
- React 19 — `Activity`, `startTransition`, and `useDeferredValue` for non-blocking updates
- React Native DevTools — ranked renders and Performance traces as the source of truth for each fix
- [expo-image](https://docs.expo.dev/versions/latest/sdk/image/) — `FeedImage` + display-sized URLs, blurhash placeholders (shimmer removed)
- [FlatList](https://reactnative.dev/docs/flatlist) — narrower `windowSize` / batch sizes for heavy post rows
- `IconSymbol` (SF Symbols / Material) — replaced six hand-rolled SVG icon components

<!-- Future apps: copy a showcase block above (heading, short intro, optional YouTube badge, screenshots or profiler captures, stack list). -->
