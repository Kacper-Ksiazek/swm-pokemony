# PR #1 — przegląd pod standard React Native 2026

Pull request: https://github.com/Kacper-Ksiazek/swm-pokemony/pull/1

Branch: `feat/list-favorites-sqlite-persistence`  
Zakres: ulubiony w SQLite (Drizzle + expo-sqlite), katalog z PokeAPI, wspólny ekran szczegółów.

Ocena względem reguł z `docs/ai-coding-rules/` oraz praktyki Expo SDK 58 / React Native z New Architecture i React Compiler.

Warstwa danych i nawigacja są zrobione porządnie. Przed mergem trzeba poprawić safe area, ciemny motyw i ekran ulubionego, który na niższym telefonie nie mieści się na ekranie. Reszta to granice modułów, kilka realnych bugów i rzeczy, które w 2026 roku warto dociągnąć, ale nie blokują tego PR.

## Zostaw tak

To jest zgodne z regułami repozytorium i z tym, jak w SDK 58 składa się taką aplikację.

- Splash zostaje, dopóki `useMigrations` nie skończy, a przy błędzie jest `ErrorStatusScreen` i restart. Nic nie czyta bazy przed migracją.
- Jedna baza w `src/data/db/client.ts`, `enableChangeListener: true`, schemat i migracje commitowane, plugin `expo-sqlite`, Metro i Babel pod pliki `.sql`. To jest aktualna ścieżka Drizzle na Expo.
- Jeden ulubiony jest wymuszony transakcją `delete` + `insert` na synchronicznym API. Komentarz przy tym jest trafny: async callback w tej sesji SQLite nie doczekałby się commita.
- Ominięcie `useLiveQuery` przez `addDatabaseChangeListener` i `setTimeout(0)` jest świadome. `useLiveQuery` czyta w hooku aktualizacji, kiedy `DELETE` jeszcze nie skończył zapisu, i potrafi zostać na poprzednim wierszu.
- React Compiler jest włączony i shared values idą przez `.get()` / `.set()`.
- Trasy są cienkie, domyślny eksport jest tylko w `src/app`, linki to `Link` + `Pressable`, tytuł siedzi w `Stack.Screen`, a `unstable_settings.anchor` trzyma powrót na listę.
- Lista jest pomyślana pod wydajność: mały sprite 96 px zamiast artworku 475 px, `recyclingKey`, `memo`, `extraData={favoriteId}`, `getItemLayout`, `windowSize`, `initialNumToRender`. `expo-image` zamiast `Image` z React Native to właściwy wybór.
- Wyścigi fetchy są gaszone licznikiem `requestId`. Mapowanie PokeAPI (camelCase, metry, kilogramy) jest po właściwej stronie granicy sieci.

## Przed mergem

### Lista chowa header i udaje safe area liczbą 64

W `src/app/(pokemon-list)/_layout.tsx` index ma `headerShown: false`, a `POKEMON_LIST_PADDING_TOP` jest 64 i wchodzi też do `getItemLayout`. To nie jest inset. Na Androidzie i na telefonie z innym wycięciem treść wjedzie pod status bar albo zostanie za duża dziura. `FlatList` nie ma własnego tła, a między kartami jest `gap: 8`, więc widać kolor pod spodem.

Przywróć header stacka (on sam robi górny inset, a `getItemLayout` zostaje przy stałym paddingu) albo licz offset z `useSafeAreaInsets()` i zamknij tę samą wartość w `getItemLayout`. Ustaw tło listy.

### `userInterfaceStyle` jest `automatic`, a UI jest na sztywno jasne

`app.json` oddaje tryb systemowi, ekrany malują `#ffffff` i `#111111`. W dark mode status bar jest jasny i znika na białym tle, a szpary listy robią się czarne. Dopóki nie ma motywu, ustaw `userInterfaceStyle` na `light`. Jak ma być `automatic`, kolory muszą iść ze schematu.

### Ekran ulubionego nie scrolluje

W `pokemon-favorite-screen.tsx` obraz ma `width: "100%"` i `aspectRatio: 1`, pod spodem są nazwa i dwa przyciski, a kontener to sam `SafeAreaView`. Na węższym, niższym telefonie przyciski schodzą poza ekran. Owiń treść w `ScrollView`. Na korzeniu taba wystarczy górna krawędź safe area — dolną zajmuje tab bar, więc `edges={["top", "bottom"]}` dokłada pusty pas nad barem.

### Szczegóły dokładają drugi górny inset

`PokemonListDetailScreen` jest pushem ze stack headerem i jednocześnie ma `SafeAreaView` z `edges={["bottom", "top"]}`. Header już zjadł górę. Zostaw dół tylko wtedy, gdy ten push chowa tab bar.

### Stała wysokość wiersza przycina Dynamic Type

Wiersz ma 92 px (`72 + 2×10`), a `Text` skaluje się z ustawieniem systemu. Przy większym foncie nazwa i numer nie mają gdzie urosnąć, a `getItemLayout` zakłada jeden rozmiar. Albo wiersz rośnie z treścią i pomiar wraca do `FlatList`, albo świadomie ograniczasz `maxFontSizeMultiplier` i to sprawdzasz.

## Warto skorygować w tym PR

### Ekran szczegółów ulubionego należy do feature listy

`src/app/pokemon-favorite/[id].tsx` eksportuje `PokemonListDetailScreen` z `@/features/pokemon-list`. Plik trasy wolno mu importować feature, ale właścicielem pusha w tabie Favorite jest wtedy lista. Wspólny ekran albo komponent powinien żyć poza oboma feature’ami.

### `src/shared` rozmija się z regułą współdzielenia

`docs/ai-coding-rules/architecture/no-cross-feature-imports.md` mówi, że pierwszy współdzielony kod idzie do `src/components` albo `src/lib`. Ten PR jest tym momentem i zakłada trzeci katalog `src/shared`.

`EmptyState`, status screeny i `useLiveFavoritePokemon` naprawdę mają dwóch konsumentów — te mogą iść do `src/components` / `src/lib`. `usePokemonDetail` i `PokemonDetails` mają jednego konsumenta. Zgodnie z `colocate-screen-internals` zostają przy ekranie szczegółów, dopóki drugi ekran ich nie użyje.

### Parser id listy przestał krzyczeć

Stary `parsePokemonIdFromUrl` rzucał przy złym URL. Teraz `fetch-pokemon-list-page.ts` robi:

```ts
id: Number.parseInt(result.url.match(/\/pokemon\/(\d+)/)?.[1] ?? "", 10),
```

`parseInt("")` to `NaN`. `keyExtractor` skleja takie wiersze w jeden klucz `"NaN"`. Zostaw wiersz tylko przy dodatniej liczbie całkowitej.

### Błąd ulubionego wygląda jak pusty stan

W `use-live-favorite-pokemon.ts` `catch` ustawia `loaded: true` i nie zapisuje błędu, więc ekran pokazuje „No favorite yet”. Sam loading to pusty `SafeAreaView`. Tu pasuje `LoadingStatusScreen` i ten sam error screen co przy liście.

### Błąd kolejnej strony listy jest cichy

To było wcześniej, ten PR tylko przeniósł import. `loadMore` przy `error !== null` nic nie robi, a error UI jest tylko gdy `items.length === 0`. Stopka z retry, bez kasowania już pobranych wierszy.

### `StyleSheet.create` powstaje na każdy wiersz

`createSkeletonImageStyles` jest w `useMemo` w `SkeletonImage`, a rozmiar i tak jest stały (72). Jeden arkusz na moduł. `StyleSheet.create` rejestruje wpis w rejestrze — nie jest to obiekt do składania per instancja.

### Serduszko ma trzech ownerów jednej skali

W `favorite-button.tsx` `onPressIn`, `onPress` i `onPressOut` wołają `scale.set`. `Pressable` puszcza `pressOut` przed `onPress`, więc sprężyna do 1 startuje i sekwencja „polubione” ją ścina. Zostaw jedną oś czasu. Przy Reduce Motion pomiń sekwencję i `transition={200}` na obrazkach listy — crossfade na recyklingu komórek przy scrollu męczy i ignoruje ustawienie dostępności.

## Następny poziom, nie blokuje

- **Stan serwera.** Licznik requestów jest solidny. Brakuje cache przy powrocie na detal, `AbortSignal`, retry i deduplikacji. W 2026 to jest TanStack Query, a nie kolejny `useEffect`. Odpowiedź PokeAPI jest rzutowana przez `as` — na granicy sieci wystarczy wąski parser (wystarczy to, co już jest robione ręcznie, byle bez `NaN`).
- **Kontrast typów.** Biały tekst na electric `#F8D030`, ice, steel i fairy nie trzyma WCAG. Przycisk retry w `ErrorStatusScreen` nie ma `accessibilityRole` i jest poniżej 44 pt.
- **Dwa layouty.** `detailTitle` i opcje stacka są skopiowane w `src/app/(pokemon-list)/_layout.tsx` i `src/app/pokemon-favorite/_layout.tsx`. Jeden helper. Tytuł bierze tylko param `name`, więc deep link bez imienia zostaje przy „Pokémon” także po załadowaniu detalu.
- **Token koloru.** `COLORS.PRIMARY` jest w części ekranów, a `status-screen.styles.ts` dalej ma wpisane `#e3350d`.
- **Proces.** Reguła gita prosi o kilka commitów w PR. Ten ma jeden. Testów świadomie nie ma w ROADMAP — gdy dojdzie runner, pierwsze przypadki to parser id, pojedynczy wiersz ulubionego i przeliczenie height/weight (decymetry i hektogramy dzielone przez 10, to jest poprawne).
