# Install libraries with expo install

Add libraries with `bunx expo install <package>` so the resolved version matches Expo SDK 58 (`expo` `~58.0.23`). `npm install`, `yarn add`, `pnpm add`, and `bun add` can pull a release this SDK does not support. Use `bunx expo install --fix` when existing versions drift from SDK 58.

## Good

```bash
bunx expo install expo-image
bunx expo install --fix
```

## Bad

```bash
npm install expo-image
bun add expo-image
```
