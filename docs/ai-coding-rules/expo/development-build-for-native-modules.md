# Use a development build for native modules

Expo Go only includes its bundled native modules. After adding a library with native code, use a development build: `npx expo run:ios`, `npx expo run:android`, or `eas build --profile development` (`bunx eas-cli build --profile development` in this Bun repo; `package.json` scripts `ios` and `android` already call the local run commands). The product later needs `react-native-vision-camera` and a map. Expo Go will not ship those. Neither is in `package.json` today.

## Good

```bash
npx expo run:ios
npx expo run:android
bunx eas-cli build --profile development
```

## Bad

```bash
# Open the Expo Go app and expect it to load react-native-vision-camera or a map module.
# Neither library is in package.json today. Expo Go will not ship them when they are added.
```
