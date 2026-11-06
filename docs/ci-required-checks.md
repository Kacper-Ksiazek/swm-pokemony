# CI and required checks on merge

## What runs on every PR

The workflow [.github/workflows/ci.yml](../.github/workflows/ci.yml) runs on `ubuntu-latest` with a **10-minute** job timeout. **Bun** is pinned to a fixed version in the workflow file (not `latest`) so CI does not pick up breaking Bun releases unexpectedly.

1. **Lint** — `bun run lint` (Biome).
2. **Typecheck** — `bun run typecheck` (`tsc --noEmit`).
3. **Native JS bundle** — `bun run export:native` (`expo export -p ios -p android`).

Step 3 does **not** produce full `.ipa` / `.apk` files. It runs Metro and proves the JavaScript bundle compiles for **iOS and Android** targets. That is the usual “does the app still build at the JS layer?” check in CI without macOS runners or Android SDK setup.

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
