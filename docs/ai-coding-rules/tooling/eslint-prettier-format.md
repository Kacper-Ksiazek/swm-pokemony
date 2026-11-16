# ESLint, Prettier, and native formatters

JavaScript and TypeScript use **ESLint** (`eslint-config-expo` flat config at repo root) and **Prettier**. Match `.prettierrc.json`: 2-space indent, line width 100, double quotes, semicolons always, trailing commas `all`. Do not add Biome or a second JS format config. `bun run lint` runs ESLint, Prettier check, and native formatters.

**Swift** in `apps/**/modules/**` uses **SwiftFormat** (`.swiftformat` at repo root). **Kotlin** uses **ktlint** with `.editorconfig` when `.kt` files appear under `apps/**/modules/**`.

Each app under `apps/*` defines `lint` and `lint:fix` (ESLint + Prettier for that package). DevDependencies are hoisted at the repo root — do not add a second ESLint/Prettier install per app.

```bash
bun run eslint        # ESLint only (whole repo)
bun run prettier:check
bun run lint          # eslint + prettier:check + lint:native
bun run lint:apps     # eslint + prettier:check in every apps/* package
cd apps/01-rn-basics && bun run lint   # single app
bun run ci            # CI parity: eslint, prettier:check, lint:native, typecheck, export:native
bun run lint:fix      # eslint --fix + prettier --write + format native
bun run format        # prettier --write + native format
bun run lint:native   # Swift + Kotlin only
bun run compile:ios   # macOS: xcodebuild for apps with Swift modules (type-check)
bun run verify:native # lint:native + compile:ios
```

Before declaring a change done, also run `bun run typecheck`. When `apps/**/modules/**` changed, run `bun run verify:native`. See [verify before done](./verify-before-done.md).
