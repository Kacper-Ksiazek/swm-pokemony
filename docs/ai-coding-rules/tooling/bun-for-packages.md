# Use bun, and install Expo packages with npx expo install

`bun.lock` is present. Run project scripts with bun. Install Expo-compatible packages with `npx expo install` so versions match the SDK. Do not use `bun add`, `npm add`, or `npm install` for those packages. Use `bunx` instead of `npx` for other one-off CLIs. `npx expo install` is the exception the project docs already specify.

## Good

```bash
npx expo install expo-image
bunx tsc --noEmit
bunx expo-doctor
bun run lint
```

## Bad

```bash
bun add expo-image
npm install expo-image
npx tsc --noEmit
```
