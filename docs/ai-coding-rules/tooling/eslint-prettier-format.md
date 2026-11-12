# ESLint, Prettier, and native formatters

JavaScript and TypeScript use **ESLint** (`eslint-config-expo` flat config at repo root) and **Prettier**. Match `.prettierrc.json`: 2-space indent, line width 100, double quotes, semicolons always, trailing commas `all`. Do not add Biome or a second JS format config. `bun run lint` runs ESLint, Prettier check, and native formatters.

**Swift** in `apps/**/modules/**` uses **SwiftFormat** (`.swiftformat` at repo root). **Kotlin** uses **ktlint** with `.editorconfig` when `.kt` files appear under `apps/**/modules/**`.

```bash
bun run eslint        # ESLint only
bun run prettier:check
bun run lint          # eslint + prettier:check + lint:native
bun run ci            # CI parity: eslint, prettier:check, lint:native, typecheck, export:native
bun run lint:fix      # eslint --fix + prettier --write + format native
bun run format        # prettier --write + native format
bun run lint:native   # Swift + Kotlin only
```

Before declaring a change done, also run `bun run typecheck`. See [verify before done](./verify-before-done.md).
