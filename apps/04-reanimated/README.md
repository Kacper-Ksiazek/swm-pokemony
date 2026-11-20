# `04_reanimated` — Reanimated workshop shell

Expo SDK 58 app for the **react-native-reanimated** exercise track. Navigation matches [`03-jsi`](../03-jsi/): **Stack** + landing list on `/`, thin routes in `src/app/`, screens in `src/features/`.

## Exercises

| Folder (workshop)              | Route                        | Feature                              |
| ------------------------------ | ---------------------------- | ------------------------------------ |
| `01-stars-2d`                  | `/stars-2d`                  | `features/stars-2d`                  |
| `02-svg-circle`                | `/svg-circle`                | `features/svg-circle`                |
| `03-stars-3d`                  | `/stars-3d`                  | `features/stars-3d`                  |
| `04-physics-ball`              | `/physics-ball`              | `features/physics-ball`              |
| `05-keyboard-handler`          | `/keyboard-handler`          | `features/keyboard-handler`          |
| `06-scroll-onboarding`         | `/scroll-onboarding`         | `features/scroll-onboarding`         |
| `07-sensors`                   | `/sensors`                   | `features/sensors`                   |
| `08-shared-element-transition` | `/shared-element-transition` | `features/shared-element-transition` |
| `09-skia`                      | `/skia`                      | `features/skia`                      |
| `10-chess`                     | `/chess`                     | `features/chess`                     |

Add each lab under the matching `src/features/<slug>/screens/<slug>/` folder. Landing entries live in `src/features/landing/screens/landing/landing.tsx` (`DEMO_SECTIONS`).

## DX

- Scripts: `lint`, `typecheck`, `export:native` (same as other `apps/*` packages).
- `experiments.typedRoutes` + `reactCompiler` in `app.json`.
- Shared values: `.get()` / `.set()` — see `docs/ai-coding-rules/react-native/reanimated-shared-value-get-set.md`.
- `import "react-native-reanimated"` in `src/app/_layout.tsx`.
- Shared chrome: `src/components/demo-screen.tsx` + **light** `theme.ts` (JSI-shaped tokens, palette like `01-rn-basics`).

## Run

```bash
bun run start:04
bun run ios:04
```

Bundle id: `com.anonymous.reanimated04`.
