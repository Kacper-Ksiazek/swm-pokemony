# Keep routes and layouts in src/app

Expo Router owns navigation. Every file under `src/app/` is a route. A `_layout.tsx` defines the navigator for that segment: `src/app/_layout.tsx` is the root `NativeTabs`, and `src/app/screen-b/_layout.tsx` and `src/app/screen-c/_layout.tsx` are the tab stacks. Components, hooks, and utils stay outside `src/app/`. Screen route files re-export the component from `src/features` (see `architecture/thin-route-files.md`). Layouts stay in `src/app`.

## Good

```tsx
// src/app/screen-c/_layout.tsx — navigator for this tab
import { Stack } from "expo-router";

export default function ScreenCLayout() {
  return (
    <Stack>
      <Stack.Screen name="index" options={{ title: "Screen C" }} />
      <Stack.Screen name="detail" options={{ title: "Screen C — detail" }} />
    </Stack>
  );
}

// src/app/screen-c/detail.tsx — route for the pushed screen
// Once features exist, this file only re-exports:
// export { ScreenCDetail as default } from "@/features/feature-c";
```

## Bad

```tsx
// src/navigation/ScreenCStack.tsx — not a route, so Expo Router will not mount it
import { Stack } from "expo-router";

export function ScreenCStack() {
  return (
    <Stack>
      <Stack.Screen name="detail" options={{ title: "Screen C — detail" }} />
    </Stack>
  );
}
```
