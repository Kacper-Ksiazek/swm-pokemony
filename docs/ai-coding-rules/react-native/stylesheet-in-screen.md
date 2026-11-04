# StyleSheet in the screen file

`StyleSheet.create` lives in the same file as the screen, below the component, as Screen A, Screen B, and Screen C do. Do not add a styles file until that screen file is mixing layout with logic. NativeWind and styled-components are not dependencies; do not introduce them.

## Good

```tsx
export default function ScreenB() {
  return (
    <View style={styles.container}>
      <Text style={styles.body}>Ten tab ma natywny header ze stacka.</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#ffffff",
    alignItems: "center",
    justifyContent: "center",
    paddingHorizontal: 24,
  },
  body: {
    fontSize: 16,
    color: "#333333",
    textAlign: "center",
  },
});
```

## Bad

```tsx
import { styles } from "./styles";

export default function ScreenB() {
  return (
    <View className="flex-1 items-center justify-center bg-white">
      <Text className="text-base text-center">Ten tab ma natywny header ze stacka.</Text>
    </View>
  );
}
```
