# Get the back button from a pushed stack route

Back navigation is a screen pushed on that tab's stack. Screen C registers `index` and `detail` in `src/app/screen-c/_layout.tsx`. Opening `/screen-c/detail` pushes `detail`, and the native header shows a back button that returns to the previous screen in this tab. The stack root (`index`) does not show a back button. `detail.tsx` does not render its own back control.

## Good

```tsx
import { Stack } from "expo-router";

export default function ScreenCLayout() {
  return (
    <Stack>
      <Stack.Screen name="index" options={{ title: "Screen C" }} />
      <Stack.Screen name="detail" options={{ title: "Screen C — detail" }} />
    </Stack>
  );
}
```

## Bad

```tsx
import { Stack } from "expo-router";

export default function ScreenCLayout() {
  return (
    <Stack>
      <Stack.Screen
        name="index"
        options={{ title: "Screen C", headerBackVisible: true }}
      />
    </Stack>
  );
}
```
