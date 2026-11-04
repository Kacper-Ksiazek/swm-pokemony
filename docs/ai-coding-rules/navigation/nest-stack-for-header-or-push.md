# Nest a Stack only when the tab needs a header or a push

A tab that shows a native header or pushes another screen owns a `Stack` in that tab's `_layout.tsx`. Screen B (`src/app/screen-b/_layout.tsx`) and Screen C (`src/app/screen-c/_layout.tsx`) do this. Screen A is only `src/app/index.tsx`: it has no header and no pushed screen, so it has no `_layout.tsx` and no `Stack`.

## Good

```tsx
import { Stack } from "expo-router";

export default function ScreenBLayout() {
  return (
    <Stack>
      <Stack.Screen name="index" options={{ title: "Screen B" }} />
    </Stack>
  );
}
```

## Bad

```tsx
import { Stack } from "expo-router";

export default function ScreenA() {
  return (
    <Stack>
      <Stack.Screen name="index" options={{ title: "Screen A" }} />
    </Stack>
  );
}
```
