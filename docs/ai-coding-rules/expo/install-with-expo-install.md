# Install libraries with expo install

Add libraries with `npx expo install <package>` so the resolved version matches Expo SDK 58 (`expo` `~58.0.23`). `npm install`, `yarn add`, `pnpm add`, and `bun add` can pull a release this SDK does not support. Use `npx expo install --fix` when existing versions drift from SDK 58.

## Good

```bash
npx expo install expo-image
npx expo install --fix
```

## Bad

```bash
npm install expo-image
bun add expo-image
```
