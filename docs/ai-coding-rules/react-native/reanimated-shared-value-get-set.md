# Reanimated shared values: use `get` and `set`

This app enables the React Compiler (`experiments.reactCompiler` in `app.json`). For `useSharedValue` from `react-native-reanimated`, read and write through `.get()` and `.set()`, not the `.value` property.

Use `.get()` when you read the current value (including inside `useAnimatedStyle`, `useDerivedValue`, and other worklets). Use `.set()` when you assign a number, an animation (`withTiming`, `withSpring`, `withSequence`, …), or an updater function.

## Good

```tsx
const progress = useSharedValue(0);

useEffect(() => {
  progress.set(withTiming(isActive ? 1 : 0, { duration: 340 }));
}, [isActive, progress]);

const animatedStyle = useAnimatedStyle(() => ({
  opacity: progress.get(),
}));

const handlePress = () => {
  scale.set(withSpring(1.2, { damping: 12 }));
};
```

## Bad

```tsx
const progress = useSharedValue(0);

useEffect(() => {
  progress.value = withTiming(isActive ? 1 : 0, { duration: 340 });
}, [isActive, progress]);

const animatedStyle = useAnimatedStyle(() => ({
  opacity: progress.value,
}));

const handlePress = () => {
  scale.value = withSpring(1.2, { damping: 12 });
};
```

When touching Reanimated shared values in new or changed code, follow this pattern consistently.
