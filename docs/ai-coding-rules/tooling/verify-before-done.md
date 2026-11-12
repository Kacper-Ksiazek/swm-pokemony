# Verify before a change is done

Before declaring a code change done, run `bun run lint` and `bun run typecheck`. `lint` is ESLint, Prettier check, and native formatters at the repo root; `typecheck` is `tsc --noEmit` in each app. Both commands must pass. Pull requests also run `bun run export:native` in CI — see [CI required checks](../../ci-required-checks.md).

## Native module source (`apps/*/modules/**`)

SwiftFormat and ktlint (`lint:native`) do **not** type-check Swift or Kotlin. After editing native module sources, run:

```bash
bun run verify:native
```

That runs `lint:native`, then `compile:ios` (headless `xcodebuild` for each app that has Swift under `modules/`). Requires **macOS and Xcode**; on Linux or Windows the compile step is skipped with a message.

If you changed `app.json`, plugins, or pod wiring, refresh generated projects first:

```bash
cd apps/03-native-modules && bunx expo prebuild --platform ios
```

`compile:ios` runs `expo prebuild --platform ios` automatically only when `ios/` is missing. For stale native trees, prebuild yourself (often `bunx expo prebuild --clean --platform ios`).

From the `03-native-modules` package only:

```bash
bun run compile:ios
```

`bun run ci` does **not** include `compile:ios` (GitHub Actions uses Linux). Use `verify:native` locally before pushing Swift/Kotlin module changes.

## Good

```bash
bun run lint
bun run typecheck
```

When `apps/**/modules/**` changed:

```bash
bun run verify:native
```

## Bad

```bash
npx expo lint
npx tsc --noEmit
```

Trusting `bun run ci` alone to catch Swift type errors (it won't).
