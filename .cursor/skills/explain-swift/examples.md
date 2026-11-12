# Example: Expo module stub

**User snippet** (from this repo’s `kksiazek-device-orientation` module):

```swift
import ExpoModulesCore

public class KksiazekDeviceOrientationModule: Module {
  public func definition() -> ModuleDefinition {
    Name("KksiazekDeviceOrientation")
    Events("onOrientationChange")
    AsyncFunction("getOrientationAsync") { () -> String in
      "KACPER"
    }
  }
}
```

**Skill output shape** (abbreviated):

## Po co to jest

Natywny moduł Expo rejestruje most JS→iOS: nazwę modułu, event o zmianie orientacji oraz asynchroniczną metodę `getOrientationAsync` (obecnie zwraca stały string — placeholder).

## Co się dzieje krok po kroku

1. `import ExpoModulesCore` — API do definiowania modułów Expo.
2. `KksiazekDeviceOrientationModule: Module` — klasa modułu; Expo instancjuje ją po stronie native.
3. `definition()` — zwraca opis modułu (DSL), nie zwykły `return` obiektu w sensie JSON.
4. `Name("KksiazekDeviceOrientation")` — nazwa widoczna w JS (`requireNativeModule('KksiazekDeviceOrientation')` / wrapper w TS).
5. `Events("onOrientationChange")` — zgłasza event, który JS może subskrybować (`addListener`).
6. `AsyncFunction("getOrientationAsync") { … }` — metoda async w JS; closure zwraca `String` (tu literał `"KACPER"`).

## W TypeScripcie (intuicja)

```typescript
import { NativeModule, requireNativeModule } from 'expo-modules-core';

type KksiazekDeviceOrientationModule = NativeModule & {
  getOrientationAsync(): Promise<string>;
  addListener(
    event: 'onOrientationChange',
    listener: (payload: unknown) => void,
  ): { remove: () => void };
};

export default requireNativeModule<KksiazekDeviceOrientationModule>('KksiazekDeviceOrientation');

// Wywołanie po stronie appki:
const label = await KksiazekDeviceOrientation.getOrientationAsync(); // teraz: "KACPER"
```

## Różnice, na które warto uważać

- `definition()` wykonuje się przy rejestracji modułu; logika w closure `getOrientationAsync` działa przy każdym wywołaniu z JS.
- Prawdziwy odczyt orientacji to UIKit (`UIDevice`, `UIWindowScene`) + ewentualnie `NotificationCenter` i `sendEvent` — jeszcze nie w tym stubie.

## W tym repo

Wróćka JS: `apps/03-native-modules/modules/kksiazek-device-orientation/src/KksiazekDeviceOrientationModule.ts` i hooki w `use-native-device-orientation.ts`.
