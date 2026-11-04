# No cross-feature imports

A feature must not import another feature. UI or helpers that no single feature owns go in `src/components` or `src/lib`. Those directories do not exist yet. Create one only when the first shared file needs a home.

## Good

```tsx
// src/features/feature-c/screens/screen-c-detail/screen-c-detail.tsx
import { formatId } from "@/lib/format-id";

export function ScreenCDetail() {
  return null;
}
```

```tsx
// src/features/feature-a/screens/screen-a/screen-a.tsx
import { AppText } from "@/components/app-text";

export function ScreenA() {
  return null;
}
```

```tsx
// src/app/screen-b/index.tsx
export { ScreenB as default } from "@/features/feature-b";
```

## Bad

```tsx
// src/features/feature-c/screens/screen-c/screen-c.tsx
import { ScreenB } from "@/features/feature-b";

export function ScreenC() {
  return null;
}
```

```tsx
// src/features/feature-c/screens/screen-c-detail/screen-c-detail.tsx
import { useScreenBState } from "@/features/feature-b/screens/screen-b/hooks/use-screen-b-state";

export function ScreenCDetail() {
  return null;
}
```

```tsx
// src/features/feature-b/screens/screen-b/screen-b.tsx
import { ScreenA } from "../../../feature-a";

export function ScreenB() {
  return null;
}
```
