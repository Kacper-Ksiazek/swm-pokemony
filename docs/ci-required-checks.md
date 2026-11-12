# CI and required checks on merge

## What runs on every PR

The workflow [.github/workflows/ci.yml](../.github/workflows/ci.yml) runs on `ubuntu-latest` with a **15-minute** job timeout. **Bun** is pinned to a fixed version in the workflow file (not `latest`) so CI does not pick up breaking Bun releases unexpectedly.

Locally, **`bun run ci`** matches the workflow: native formatter setup, `eslint`, `prettier:check`, `lint:native`, `typecheck`, `export:native`.

On GitHub the same steps run as:

1. **ESLint** — `bun run eslint` (repo root).
2. **Prettier** — `bun run prettier:check`.
3. **Native format** — `bun run lint:native` (SwiftFormat / ktlint under `apps/**/modules/**` when sources exist).
4. **Typecheck** — `bun run typecheck` runs `tsc --noEmit` in **each** package under `apps/*` that defines a `typecheck` script (`bun run --filter './apps/*' typecheck`).
5. **Native JS bundle** — `bun run export:native` runs `expo export -p ios -p android` in **each** such app the same way.

Adding a new app: create `apps/<id>/` with `typecheck` and `export:native` in its `package.json`; root scripts pick it up automatically. Lint stays at the repo root only.

Step 3 does **not** produce full `.ipa` / `.apk` files. It runs Metro and proves the JavaScript bundle compiles for **iOS and Android** targets. That is the usual “does the app still build at the JS layer?” check in CI without macOS runners or Android SDK setup.

**Swift / Kotlin in `apps/*/modules/**`** — `lint:native` is format-only. Locally on macOS, run `bun run verify:native` (`lint:native` + `compile:ios` via `xcodebuild`) before merge when module native sources change. See [verify before done](ai-coding-rules/tooling/verify-before-done.md).

Full **native** binaries need Xcode / Gradle (or **EAS Build** in the cloud). See [EAS Build](https://docs.expo.dev/build/introduction/).

## Why web export is not in CI (for now)

`expo export -p web` currently fails in this repo because `expo-sqlite` web worker expects a Wasm asset path that does not resolve during web bundling. Native export avoids that path.

## Making checks required before merge (GitHub)

1. Push the workflow so it runs at least once on the default branch (or open a PR and confirm the **CI** workflow appears).
2. In the repo: **Settings → Rules → Rulesets** (or **Branches → Branch protection rules** on classic UI).
3. Add a rule for `main` (and `master` if you use it).
4. Enable **Require status checks to pass before merging**.
5. Search for and select the job check name: **CI / check** (or the exact name shown under the green check on a PR).

After that, merges are blocked until lint, typecheck, and native export all pass.
