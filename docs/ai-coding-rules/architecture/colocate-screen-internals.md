# Colocate screen internals

When a screen grows, add files inside that screen folder. Create `components/` or `hooks/` only together with the first file that belongs there. Those files stay private to that screen. When a second screen in the same feature needs one of them, move it to `src/features/<feature>/components` or `src/features/<feature>/hooks`. Feature-level files stay internal: other screens in that feature import them by relative path, and `index.ts` keeps exporting screens only.

## Good

```text
src/features/feature-c/screens/screen-c-detail/
  index.ts
  screen-c-detail.tsx
  components/
    detail-body.tsx
  hooks/
    use-detail-title.ts
```

```tsx
// src/features/feature-c/screens/screen-c-detail/screen-c-detail.tsx
import { DetailBody } from "./components/detail-body";
import { useDetailTitle } from "./hooks/use-detail-title";

export function ScreenCDetail() {
  return null;
}
```

After `screen-c` needs the same hook, move it up and delete the screen-private copy:

```text
src/features/feature-c/
  index.ts
  hooks/
    use-detail-title.ts
  screens/
    screen-c/
      index.ts
      screen-c.tsx
    screen-c-detail/
      index.ts
      screen-c-detail.tsx
      components/
        detail-body.tsx
```

```tsx
// src/features/feature-c/screens/screen-c/screen-c.tsx
import { useDetailTitle } from "../../hooks/use-detail-title";

export function ScreenC() {
  return null;
}
```

```tsx
// src/features/feature-c/screens/screen-c-detail/screen-c-detail.tsx
import { DetailBody } from "./components/detail-body";
import { useDetailTitle } from "../../hooks/use-detail-title";

export function ScreenCDetail() {
  return null;
}
```

```ts
// src/features/feature-c/index.ts
export { ScreenC } from "./screens/screen-c";
export { ScreenCDetail } from "./screens/screen-c-detail";
```

## Bad

```text
src/features/feature-b/screens/screen-b/
  index.ts
  screen-b.tsx
  components/
  hooks/
```

```tsx
// src/features/feature-c/screens/screen-c/screen-c.tsx
import { DetailBody } from "../screen-c-detail/components/detail-body";

export function ScreenC() {
  return null;
}
```

```ts
// src/features/feature-c/index.ts
export { ScreenC } from "./screens/screen-c";
export { ScreenCDetail } from "./screens/screen-c-detail";
export { DetailBody } from "./screens/screen-c-detail/components/detail-body";
export { useDetailTitle } from "./hooks/use-detail-title";
```
