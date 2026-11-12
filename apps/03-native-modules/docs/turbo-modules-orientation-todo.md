# Turbo Modules + Swift: orientacja urządzenia (learning TODO)

Checklista krok po kroku dla `apps/03-native-modules` (Expo SDK 58, React Native 0.88, `expo-dev-client`).

**Cel:** własny moduł w **Swifcie** + **JS API** jak uproszczone [`expo-screen-orientation`](https://docs.expo.dev/versions/latest/sdk/screen-orientation/) — bieżąca orientacja + event przy obrocie.

**Gdzie w aplikacji:** Task 1 (`src/features/task-1/`, route `/`).

---

## Zanim zaczniesz — mapa pojęć (~5 min)

- [x] **Turbo Module** — natywny moduł pod New Architecture (szybszy most JS ↔ native). W Expo na start nie piszesz codegen ręcznie: używasz **Expo Modules API** (`expo-modules-core`); pod spodem to i tak ścieżka nowej architektury.
- [x] **Nie edytujesz `ios/` ręcznie** — kod Swift mieszka w `modules/<nazwa>/`, a `expo prebuild` / `expo run:ios` go podłącza. Zobacz `docs/ai-coding-rules/expo/no-hand-edited-native-projects.md`.
- [x] **Expo Go odpada** — tylko **development build**. Zobacz `docs/ai-coding-rules/expo/development-build-for-native-modules.md`.
- [x] **Referencja produktowa:** `expo-screen-orientation` instalujesz tylko do **porównania API/UX**, nie kopiujesz kodu 1:1 na pierwszym kroku.

**Checkpoint:** rozumiesz różnicę *moduł w `modules/`* vs *grzebanie w `ios/Pods/...`*.

---

## Faza 0 — Środowisko i baseline

- [x] Z roota repo: `bun install`
- [x] Dev build iOS: `bun run ios:03`  
  (albo `cd apps/03-native-modules && bun run ios`)
- [x] Potwierdź: Task 1 (`/`) się otwiera, Metro działa, to **nie** Expo Go.
- [x] Opcjonalnie — porównanie z Expo:  
  `cd apps/03-native-modules && bunx expo install expo-screen-orientation`  
  Zapisz w notatkach: `getOrientationAsync()`, `addOrientationChangeListener()`.

**Uczysz się:** dev client = Twoja aplikacja + Twój native code.

**Checkpoint:** obrót symulatora (⌘← / ⌘→) **nie zmienia** jeszcze nic w UI Task 1 — to OK.

---

## Faza 1 — Szkielet lokalnego modułu (Swift + autolinking)

- [x] W `apps/03-native-modules/` utwórz lokalny moduł: `modules/kksiazek-device-orientation/`  
  Typowa struktura: `expo-module.config.json`, `ios/*.swift`, `src/index.ts`, `package.json` modułu.
- [x] Spójna nazwa w Swift/JS: `KksiazekDeviceOrientation` (pakiet npm: `kksiazek-device-orientation`).
- [x] W `expo-module.config.json` ustaw platformę **ios** (Android na później).
- [x] Szkic API w TypeScript:

```ts
// modules/kksiazek-device-orientation/src/index.ts — docelowy kontrakt
export type Orientation =
  | "PORTRAIT_UP"
  | "PORTRAIT_DOWN"
  | "LANDSCAPE_LEFT"
  | "LANDSCAPE_RIGHT"
  | "UNKNOWN";

export function getOrientationAsync(): Promise<Orientation> {
  // podłącz do native
}

export function addOrientationChangeListener(
  listener: (event: { orientation: Orientation }) => void,
): { remove: () => void } {
  // EventEmitter modułu
}
```

- [ ] **Przebuduj native:** w `apps/03-native-modules` uruchom `bun run ios` (po dodaniu modułu — zawsze rebuild, nie sama zmiana JS).
- [ ] Smoke test w `Task1Screen`: import modułu i `console.log(await getOrientationAsync())`.

Dokumentacja: [Expo Modules — get started](https://docs.expo.dev/modules/get-started/).

**Uczysz się:** *każda zmiana w Swift = nowy build iOS*; zmiana samego TS = reload Metro.

**Checkpoint:** w logach widzisz orientację (nawet jeśli na razie zwracasz stałą `"UNKNOWN"`).

---

## Faza 2 — Swift: odczyt orientacji

- [ ] W `KksiazekDeviceOrientationModule.swift` (Expo `Module`):
  - [ ] `Name("KksiazekDeviceOrientation")`
  - [ ] `AsyncFunction("getOrientationAsync")` → mapowanie UIKit → enum stringowy w JS
- [ ] Mapowanie (świadomie, jak przy `expo-screen-orientation`):

  | UIKit (`UIDeviceOrientation`) | Twój enum |
  |-------------------------------|-----------|
  | `portrait` | `PORTRAIT_UP` |
  | `portraitUpsideDown` | `PORTRAIT_DOWN` |
  | `landscapeLeft` | `LANDSCAPE_LEFT` |
  | `landscapeRight` | `LANDSCAPE_RIGHT` |
  | `faceUp`, `faceDown`, `unknown` | `UNKNOWN` (lub osobne wartości) |

  **Uwaga:** landscape left/right w UIKit bywa mylące względem „jak leży telefon w dłoni” — zapisz w komentarzu Swifcie, jak zmapowałeś i porównaj z `expo-screen-orientation`.

- [ ] Źródło na start: `UIDevice.current.orientation` (prościej).
- [ ] Level-up: `UIWindowScene.interfaceOrientation` — bliżej tego, co użytkownik *widzi*.
- [ ] W lifecycle modułu: `UIDevice.current.beginGeneratingDeviceOrientationNotifications()` + `endGenerating...` przy destroy.

**Uczysz się:** *device orientation* vs *interface orientation* — krótka notatka przy Task 1 lub w komentarzu w Swift.

**Checkpoint:** po obrocie symulatora `getOrientationAsync()` zwraca inną wartość (po rebuildzie).

---

## Faza 3 — Eventy (listener jak `addOrientationChangeListener`)

- [ ] W Swift: zdefiniuj event, np. `Events("onOrientationChange")` (nazwa zgodna z konwencją Twojego modułu).
- [ ] Observer: `NotificationCenter` + `UIDevice.orientationDidChangeNotification`.
- [ ] W handlerze: przelicz orientację, wyślij `sendEvent("onOrientationChange", ["orientation": "..."])`.
- [ ] W TS: `addOrientationChangeListener` przez `EventEmitter` modułu — [Module API](https://docs.expo.dev/modules/module-api/).
- [ ] W `useEffect` na Task 1: subskrypcja + cleanup `remove()`.

**Uczysz się:** moduł **pull** (`AsyncFunction`) vs **push** (`Events`).

**Checkpoint:** obracasz symulator → label na ekranie aktualizuje się **bez** ręcznego odświeżania.

---

## Faza 4 — UI na Task 1 (feel jak expo-screen-orientation)

Ścieżki: `src/features/task-1/screens/task-1/task-1.tsx`, route tylko re-export w `src/app/index.tsx`.

- [ ] Duży tekst: **bieżąca orientacja** (enum → czytelny label).
- [ ] Lista ostatnich ~5 eventów (timestamp + wartość) — widać kolejność i ewentualny debounce.
- [ ] Przycisk **„Odśwież”** wołający `getOrientationAsync()` (różnica: jednorazowy odczyt vs live listener).
- [ ] Sekcja **„vs expo-screen-orientation”**: drugi blok UI z oficjalnym pakietem obok Twojego — porównujesz wartości przy obrocie.
- [ ] `app.json` ma `"orientation": "portrait"`. Na nauce obrotów wybierz jedną ścieżkę:
  - [ ] Tymczasowo `"default"` lub polityka pozwalająca na obrót + ponowny `bun run ios`, **albo**
  - [ ] Świadomie testujesz tylko to, co iOS pozwala przy locku portrait — i notujesz ograniczenie na ekranie.

**Checkpoint:** ekran to mały „orientation lab”, nie pusty placeholder.

---

## Faza 5 — Jakość (minimum)

- [ ] Typy TS eksportowane z modułu; bez `any`.
- [ ] Android: stub (`UNKNOWN` + TODO) albo `Platform.OS` w UI z jasnym komunikatem.
- [ ] Z roota repo: `bun run lint` i `bun run typecheck`.
- [ ] Krótki komentarz w module: skąd mapowanie landscape (żeby wrócić za miesiąc).

**Checkpoint:** lint + typecheck green lokalnie (jak w CI).

---

## Faza 6 — Turbo Modules „na serio” (opcjonalnie)

Gdy Expo Module już działa:

- [ ] Przeczytaj: [React Native — Turbo Native Modules](https://reactnative.dev/docs/the-new-architecture/pillars-turbomodules).
- [ ] Przy starcie aplikacji: gdzie w logach / Xcode widać rejestrację modułu (JS proxy → native `Module`).
- [ ] **Osobny task/PR:** czysty Turbo Module z codegen (`spec` w TS + Swift) — trudniejsze w Expo; sensownie jako Task 4/5, nie Task 1.

---

## Proponowany podział Tasków (taby w app)

| Tab | Zakres |
|-----|--------|
| **Task 1** | Moduł `kksiazek-device-orientation` + UI lab |
| **Task 2** | Lock orientacji (`lockAsync` / API iOS) — pełniejsza kopia Expo |
| **Task 3** | Android (Kotlin), ten sam kontrakt TS |
| **Task 4** | Czysty Turbo Module / codegen |
| **Task 5** | Inne native (np. vision / mapa z briefu produktu) |

---

## Najczęstsze pułapki

1. **Zmiana Swift bez `expo run:ios`** → stary binary, „moduł nie istnieje”.
2. **Test w Expo Go** → własny moduł się nie załaduje.
3. **`"orientation": "portrait"` w `app.json`** → UI może się nie obracać mimo poprawnego `UIDevice`.
4. **Landscape left/right** — porównaj z `expo-screen-orientation` na tym samym dev buildzie.

---

## Przydatne komendy (repo)

```bash
# root
bun install
bun run lint
bun run typecheck
bun run ios:03

# pakiet 03
cd apps/03-native-modules
bun run start
bun run ios
bunx expo install <package>
```

---

## Done definition (Task 1)

- [ ] Własny moduł w `modules/kksiazek-device-orientation/` z `getOrientationAsync` + listenerem na zmianę.
- [ ] Task 1 pokazuje live orientację i historię eventów.
- [ ] Opcjonalnie: obok wartości z `expo-screen-orientation` — zgodność lub udokumentowana różnica.
- [ ] `bun run lint` + `bun run typecheck` przechodzą.
