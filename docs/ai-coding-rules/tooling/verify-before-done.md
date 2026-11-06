# Verify before a change is done

Before declaring a code change done, run `bun run lint` and `bun run typecheck`. `lint` is `biome check .`; `typecheck` is `tsc --noEmit`. Both commands must pass. Pull requests also run `bun run export:native` in CI — see [CI required checks](../../ci-required-checks.md).

## Good

```bash
bun run lint
bun run typecheck
```

## Bad

```bash
npx expo lint
npx tsc --noEmit
```
