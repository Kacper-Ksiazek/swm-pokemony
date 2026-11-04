# Biome formats this repo

Biome is the only formatter and linter. Match `biome.json`: 2-space indent, line width 100, double quotes, semicolons always, and trailing commas set to `all`. Do not add ESLint, Prettier, or another format config. The Expo template in the README mentions them; this repo already chose Biome (`bun run lint` runs `biome check`).

## Good

```tsx
const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#ffffff",
    alignItems: "center",
  },
});
```

## Bad

```tsx
const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#ffffff',
    alignItems: 'center'
  }
})
```
