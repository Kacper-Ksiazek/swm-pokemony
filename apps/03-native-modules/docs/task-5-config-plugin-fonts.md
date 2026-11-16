# Task 5 — Expo Config Plugin & Font Icons

Podsumowanie implementacji własnego Expo Config Pluginu do obsługi ikon jako fontu (`.ttf`) zamiast osobnych komponentów SVG.

## Jaki problem rozwiązujemy

1. **Wydajność renderowania (SVG vs Font Icons):**
   - Każda ikona SVG (`react-native-svg`) tworzy pełne poddrzewo komponentów w React (`<Svg>` + `<Path>`) oraz natywne widoki wektorowe (`RNSVGPath`). Przy setkach ikon na ekranie obciąża to zarówno wątek JS, jak i natywny pipeline renderera.
   - Font ikonowy pakuje wszystkie ikony do jednego pliku `.ttf`. Każda ikona odpowiada konkretnemu znakowi Unicode (np. `\uE9A2`), dzięki czemu system renderuje ikony jak zwykły `<Text />`.

2. **Trwałość konfiguracji natywnej w CNG (`expo prebuild`):**
   - W Expo z Continuous Native Generation katalogi `ios/` i `android/` są generowane automatycznie. Ręczne dodanie fontu w Xcode lub Android Studio znika przy kolejnym `prebuild`.
   - Własny Config Plugin modyfikuje wygenerowane projekty natywne podczas `expo prebuild`, dzięki czemu font jest zawsze spakowany jako natywny asset.

---

## Struktura w projekcie

- `assets/fonts/icomoon/icomoon.ttf` — plik fontu z 6 ikonami (`mug`, `fire`, `lab`, `truck`, `switch`, `cloud-download`).
- `assets/fonts/icomoon/selection.json` — konfiguracja i glyphmapa z IcoMoon (`fontFamily`, kody Unicode, ścieżki SVG do porównania).
- `plugins/with-icon-font.ts` — własny Expo Config Plugin podpięty w `app.json`.
- `src/features/task-5/screens/task-5/`:
  - `shared/icomoon-glyphs.ts` — parser `selection.json` (mapa `nazwa -> kod Unicode`, `getIcomoonGlyph`, `paths` dla SVG).
  - `reference/reference-font-panel.tsx` — porównanie `expo-font` (`useFonts()` + `<Text />`) vs `react-native-svg` (`<Svg><Path /></Svg>`).
  - `solution/components/icon.tsx` — komponent `<Icon name="..." size={...} color={...} />` renderujący glif w `<Text />`.
  - `solution/solution-font-panel.tsx` — ten sam benchmark z wykorzystaniem fontu wpiętego natywnie przez Config Plugin (bez `useFonts()`).

---

## Jak działa `plugins/with-icon-font.ts`

Plugin przyjmuje w `app.json` ścieżkę do folderu z fontami (`["./plugins/with-icon-font.ts", "./assets/fonts/icomoon"]`) i obsługuje obie platformy:

- **`ConfigPlugin<T>`** — typ funkcji pluginu `(config, props) => config`.
- **iOS:**
  - `withXcodeProject` + `IOSConfig.XcodeUtils.ensureGroupRecursively(project, "Resources")` + `addResourceFileToGroup(..., { isBuildFile: true })` — dodaje pliki `.ttf`/`.otf` do `project.pbxproj` jako zasoby budowane do paczki `.app`.
  - `withInfoPlist` — dopisuje nazwy plików fontów do tablicy `UIAppFonts` w `Info.plist`, żeby iOS zarejestrował font przy starcie aplikacji.
- **Android:**
  - `withDangerousMod(config, ["android", ...])` — kopiuje pliki `.ttf`/`.otf` do `android/app/src/main/assets/fonts/`, skąd Android wczytuje fonty automatycznie.
- **`createRunOncePlugin(withIconFont, "with-icon-font", "1.0.0")`** — zapewnia idempotentność (plugin wykona się maksymalnie raz na `prebuild`).

---

## Wyniki benchmarku (600 ikon, tryb dev, React DevTools Profiler)

| Wariant | Czas React commit | Uwagi |
| --- | --- | --- |
| Reference — SVG (`<Svg><Path /></Svg>`) | `~679–699 ms` | Ponad 2x wolniej w samym JS + narzut natywnych widoków `RNSVGPath` |
| Reference — Font (`<Text />` + `expo-font`) | `~255–269 ms` | Najlżejsze drzewo, ładowanie runtime przez `useFonts()` |
| Solution — Font (`<Icon />` + Config Plugin) | `~303–310 ms` | Lekki narzut wrappera `<Icon />` względem gołego `<Text />`, brak `useFonts()` |

*Uwaga: pomiary pochodzą z trybu dev z narzutem `React.Profiler`. W buildzie release czasy są znacznie niższe, a przewaga Font Icons po stronie natywnej (CoreText / Android Canvas vs wektory SVG) jeszcze bardziej wyraźna.*
