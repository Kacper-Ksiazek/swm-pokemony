# Verify before a change is done

Before declaring a code change done, run `bun run lint` and `bunx tsc --noEmit`. `lint` is `biome check .`. Both commands must pass.

## Good

```bash
bun run lint
bunx tsc --noEmit
```

## Bad

```bash
npx expo lint
npx tsc --noEmit
```
