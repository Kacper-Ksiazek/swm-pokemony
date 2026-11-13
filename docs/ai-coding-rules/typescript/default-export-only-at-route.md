# Default exports only on route files

Expo Router route files under `src/app/`, including every `_layout.tsx`, use a default export. ESLint allows default exports in route files; feature modules use named exports. A screen route re-exports that named screen:

```ts
export { ScreenA as default } from "@/features/feature-a";
```

## Good

```ts
// src/app/_layout.tsx — navigators stay on the route and default-export
export default function RootLayout() {
  return null;
}

// src/features/feature-a/screens/screen-a/screen-a.tsx — named export
export function ScreenA() {
  return null;
}

// src/app/index.tsx — thin re-export
export { ScreenA as default } from "@/features/feature-a";
```

## Bad

```ts
// src/features/feature-a/screens/screen-a/screen-a.tsx
export default function ScreenA() {
  return null;
}

// src/app/index.tsx — Expo Router requires a default export on the route
export function ScreenA() {
  return null;
}
```
