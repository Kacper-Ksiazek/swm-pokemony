# Pressable for tappable controls

Tappable controls use `Pressable`. A navigation link wraps that pressable with Expo Router `Link` and `asChild`, as on Screen C. Do not use `TouchableOpacity` unless a platform API requires it.

## Good

```tsx
<Link href="/screen-c/detail" asChild>
  <Pressable style={styles.button}>
    <Text style={styles.buttonLabel}>Otwórz ekran z back</Text>
  </Pressable>
</Link>
```

## Bad

```tsx
<TouchableOpacity onPress={() => router.push("/screen-c/detail")}>
  <Text style={styles.buttonLabel}>Otwórz ekran z back</Text>
</TouchableOpacity>
```
