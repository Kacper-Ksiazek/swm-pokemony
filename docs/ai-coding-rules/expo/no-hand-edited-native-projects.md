# Do not hand-edit native projects

`ios/` and `android/` are generated (continuous native generation). `.gitignore` lists both under generated native folders. `android/` is not in the tree; a local `ios/` prebuild may be present and is still generated, not source. Configure native behavior in `app.json` and config plugins. Never create or edit those directories by hand.

## Good

```json
{
  "plugins": [
    "expo-router",
    [
      "expo-splash-screen",
      {
        "backgroundColor": "#208AEF",
        "image": "./assets/images/splash-icon.png",
        "imageWidth": 76
      }
    ]
  ]
}
```

## Bad

```bash
echo 'pod "SomePod"' >> ios/Podfile
mkdir -p android/app/src/main
```
