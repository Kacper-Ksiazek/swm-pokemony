# Visible strings inside Text

Visible strings go inside React Native `Text`. ESLint enforces `react-native/no-raw-text` under `src/app/**`. `NativeTabs.Trigger.Label` and `Stack.Title` are in the skip list, because those APIs take raw text children.

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
