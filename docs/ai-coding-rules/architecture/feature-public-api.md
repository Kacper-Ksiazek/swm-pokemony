# Feature public API

The feature `index.ts` is the only public API. Code inside the feature uses named exports. The default export exists only in the route file, as a re-export of that named screen.

## Good

```ts
// src/features/feature-a/index.ts
export { ScreenA } from "./screens/screen-a";
```

```ts
// src/features/feature-b/index.ts
export { ScreenB } from "./screens/screen-b";
```

```ts
// src/features/feature-c/index.ts
export { ScreenC } from "./screens/screen-c";
export { ScreenCDetail } from "./screens/screen-c-detail";
```

```tsx
// src/features/feature-c/screens/screen-c-detail/screen-c-detail.tsx
export function ScreenCDetail() {
  return null;
}
```

```tsx
// src/app/index.tsx
export { ScreenA as default } from "@/features/feature-a";
```

```tsx
// src/app/screen-c/detail.tsx
export { ScreenCDetail as default } from "@/features/feature-c";
```

## Bad

```tsx
// src/features/feature-c/screens/screen-c/screen-c.tsx
export default function ScreenC() {
  return null;
}
```

```tsx
// src/app/screen-b/index.tsx
export { ScreenB as default } from "@/features/feature-b/screens/screen-b";
```

```tsx
// src/app/screen-c/detail.tsx
export { ScreenCDetail as default } from "@/features/feature-c/screens/screen-c-detail/screen-c-detail";
```
