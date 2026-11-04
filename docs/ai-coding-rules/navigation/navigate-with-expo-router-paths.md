# Navigate with expo-router path strings

Move between screens with `Link` and `router` imported from `expo-router`. Targets are path strings such as `/screen-c/detail`. Screen C pushes its detail screen with `<Link href="/screen-c/detail" asChild>`. The same path is `router.push("/screen-c/detail")`. Do not call React Navigation's `navigate` with a screen name.

## Good

```tsx
import { Link, router } from "expo-router";
import { Pressable, Text } from "react-native";

export default function ScreenCIndex() {
  return (
    <Link href="/screen-c/detail" asChild>
      <Pressable>
        <Text>Otwórz ekran z back</Text>
      </Pressable>
    </Link>
  );
}

export function openScreenCDetail() {
  router.push("/screen-c/detail");
}
```

## Bad

```tsx
import { useNavigation } from "@react-navigation/native";
import { Pressable, Text } from "react-native";

export default function ScreenCIndex() {
  const navigation = useNavigation();

  return (
    <Pressable onPress={() => navigation.navigate("detail")}>
      <Text>Otwórz ekran z back</Text>
    </Pressable>
  );
}
```
