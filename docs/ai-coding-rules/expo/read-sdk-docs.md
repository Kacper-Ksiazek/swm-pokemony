# Read the installed SDK docs

This app uses Expo SDK 58 (`expo` `~58.0.23` in `package.json`, entry `expo-router/entry`). Before using an Expo, EAS, or React Native API, read that major version and fetch the matching docs at https://docs.expo.dev/versions/v58.0.0/. For anything else, fetch https://docs.expo.dev/llms.txt and follow its links. Do not answer from memory; Expo breaks APIs across SDKs.

## Good

```bash
# package.json → "expo": "~58.0.23" (SDK 58)
# https://docs.expo.dev/versions/v58.0.0/
# https://docs.expo.dev/llms.txt
```

## Bad

```bash
# Calling expo-router, a config plugin, or EAS from memory of an older SDK
# without reading https://docs.expo.dev/versions/v58.0.0/
```
