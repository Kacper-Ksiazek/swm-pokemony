# Thin route files

`src/app` holds navigators and thin route files only. A route file default-exports a screen from a feature. Layouts (`_layout.tsx`) stay in `src/app` because they configure `NativeTabs` and `Stack` (`src/app/_layout.tsx`, `src/app/screen-b/_layout.tsx`, `src/app/screen-c/_layout.tsx`).

## Good

```tsx
// src/app/index.tsx
export { ScreenA as default } from "@/features/feature-a";
```

```tsx
// src/app/screen-b/index.tsx
export { ScreenB as default } from "@/features/feature-b";
```

```tsx
// src/app/screen-c/index.tsx
export { ScreenC as default } from "@/features/feature-c";
```

```tsx
// src/app/screen-c/detail.tsx
export { ScreenCDetail as default } from "@/features/feature-c";
```

```tsx
// src/app/screen-c/_layout.tsx
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
// src/app/screen-b/index.tsx
import { Text, View } from "react-native";

export default function ScreenB() {
  return (
    <View>
      <Text>Screen B</Text>
    </View>
  );
}
```

```tsx
// src/features/feature-c/screen-c-layout.tsx
import { Stack } from "expo-router";

export function ScreenCLayout() {
  return (
    <Stack>
      <Stack.Screen name="index" options={{ title: "Screen C" }} />
      <Stack.Screen name="detail" options={{ title: "Screen C — detail" }} />
    </Stack>
  );
}
```
