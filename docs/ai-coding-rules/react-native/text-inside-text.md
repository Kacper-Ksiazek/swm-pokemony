# Visible strings inside Text

Visible strings go inside React Native `Text`. Biome treats `noReactNativeRawText` as an error under `src/app/**`. `NativeTabs.Trigger.Label` and `Stack.Title` are the only skip entries, because those APIs take raw text children.

## Good

```tsx
<Text style={styles.subtitle}>Bez nagłówka — sam content w tabie.</Text>

<NativeTabs.Trigger.Label>Screen A</NativeTabs.Trigger.Label>
```

## Bad

```tsx
<View style={styles.container}>
  Bez nagłówka — sam content w tabie.
</View>
```
