# Screen folder

Feature UI lives in `src/features/<feature>/screens/<screen>/`. The screen folder holds the component file plus an `index.ts` that re-exports it by name. Map routes to folders as `index` → `feature-a/screens/screen-a`, `screen-b` → `feature-b/screens/screen-b`, `screen-c` → `feature-c/screens/screen-c`, and `screen-c/detail` → `feature-c/screens/screen-c-detail`.

## Good

```text
src/features/feature-c/
  index.ts
  screens/
    screen-c/
      index.ts
      screen-c.tsx
    screen-c-detail/
      index.ts
      screen-c-detail.tsx
```

```ts
// src/features/feature-c/screens/screen-c/index.ts
export { ScreenC } from "./screen-c";
```

```ts
// src/features/feature-c/screens/screen-c-detail/index.ts
export { ScreenCDetail } from "./screen-c-detail";
```

```tsx
// src/features/feature-c/screens/screen-c/screen-c.tsx
export function ScreenC() {
  return null;
}
```

```text
src/features/feature-b/
  index.ts
  screens/
    screen-b/
      index.ts
      screen-b.tsx
```

## Bad

```text
src/features/feature-c/
  screen-c.tsx
  screen-c-detail.tsx
```

```ts
// src/features/feature-c/screens/screen-c/index.ts
export { default } from "./screen-c";
```

```text
src/features/feature-a/screens/index/
  index.tsx
```
