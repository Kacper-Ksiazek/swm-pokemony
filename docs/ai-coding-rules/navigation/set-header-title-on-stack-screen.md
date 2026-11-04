# Set header titles with Stack.Screen options

The header title is `options.title` on `Stack.Screen` in the tab layout. Screen B uses `"Screen B"`. Screen C uses `"Screen C"` on `index` and `"Screen C — detail"` on `detail`. The screen file renders content only. Do not set the title with `Stack.Title` in the screen body.

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
import { Text, View } from "react-native";

export default function ScreenCDetail() {
  return (
    <View>
      <Stack.Title>Screen C — detail</Stack.Title>
      <Text>Natywny back wraca do poprzedniego ekranu w stacku tego taba.</Text>
    </View>
  );
}
```
