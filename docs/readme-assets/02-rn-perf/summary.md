### Exercise 1 — `PostDetailHeader` / lokalny stan engagementu

**Problem**

Tapnięcie like w nagłówku posta podnosiło `useState` w `PostDetailScreen`, więc w profilerze widać było re-render całego `./post/[id].tsx` (~73 ms w ranked), zamiast wąskiej aktualizacji UI engagementu.

**Rozwiązanie**

- Wyciągnięcie like / bookmark / share do `PostDetailEngagement` z własnym stanem.
- `StyleSheet` zamiast inline w headerze i engagement.
- Stabilniejsze API `PostOptionsMenu` (`setVisible` zamiast inline `onClose`).

**Profiler (workflow: tap like)**

| | Screenshot |
|---|---|
| Before | `docs/assets/02-rn-perf/exercise-1-before.png` |
| After | `docs/assets/02-rn-perf/exercise-1-after.png` |

---

### Exercise 2 — porządki w `PostDetailScreen`

**Problem**

`PostDetailScreen` był „hubem” stanu i UI: draft komentarza (`newComment`) żył w ekranie, `colors` schodziły propsami do każdego wiersza listy, footer „You might also like” liczył `findRelatedPosts` inline w pliku route’a, a lokalny `ColorsContext.Provider` owijał cały ekran. Każda litera w polu komentarza, wejście w tryb odpowiedzi i rozwinięcie wątku odpalały re-render rodzica i — w profilerze — masowy re-render `CommentItem` / `VirtualizedList`.

**Workflow w profilerze**

Rozwinięcie listy odpowiedzi pod pierwszym komentarzem → odpowiedź na ten komentarz → submit.

**Co jest na niezacommitowanym diffie (skrót)**

| Obszar | Zmiana |
|--------|--------|
| `PostDetailScreen` (`post/[id].tsx`) | Usunięty `newComment` z ekranu; `handleAddComment(draft)` dostaje tekst z inputu; `StyleSheet` dla layoutu; `ListFooterComponent` → memo `PostDetailRelatedPosts`; `CommentItem` bez prop `colors`. |
| `CommentInput` | Monolit `comment-input.tsx` → folder (`useCommentInput`, własny stan tekstu, `replyTo` w hooku); ekran nie re-renderuje się przy `onChangeText`. |
| Theme | `ColorsProvider` w root `_layout.tsx`; usunięte per-screen `ColorsContext.Provider`; komponenty czytają `ColorsContext` (feed, detail, action buttons, `CommentItem`, related posts). |
| Powiązane | Ten sam wzorzec inputu w `post/comments/[id].tsx`; drobne propsy w `LikeButton` / `ShareButton` / `BookmarkButton`; `PostOptionsMenu.setVisible`. |

**Wynik**

Przy workflowie komentarzy (rozwinięcie odpowiedzi + dodanie reply do jednego wątku) **wyeliminowaliśmy problem masowego re-renderu listy komentarzy**. W profilerze (after) widać wąską aktualizację `VirtualizedList` (stan wewnętrzny `cellsAroundViewport` / `renderMask`), a nie ponowne renderowanie całego drzewa `CommentItem` przez zmianę stanu rodzica ekranu.

| | Screenshot |
|---|---|
| Before (ciężki commit ekranu szczegółu) | `docs/assets/02-rn-perf/exercise-2-before.png` |
| After (workflow komentarzy) | `docs/assets/02-rn-perf/exercise-2-after.png` |

---

### Exercise 2.3 — React Compiler (feed)

**Kontekst**

Tab **Home** (`FeedList` / `FeedItem`). Like na poście aktualizuje `feedData` w `HomeScreen`; przy scrollu i interakcjach profiler łapie długą serię commitów (np. **51** w sesji).

**Problem (before — bez React Compiler)**

Jeden commit w ranked (np. **2 / 51**, ~**204 ms** renderu) pokazuje lawinę powtórzeń **`TagList`**, **`ActionButtons`**, **`PostHeader`** i ikon w każdym widocznym wierszu. W „Why did this render?” dla `Tag` / `TagList` widać wyłącznie: **The parent component rendered** — propsy tagów się nie zmieniły, a dzieci i tak przeliczają cały subtree feedu po każdym `setFeedData` / re-renderze rodzica listy.

**Workflow w profilerze**

Scroll feedu → like na poście (opcjonalnie kilka like’ów pod rząd) → wybór commitu z gęstego paska na osi czasu.

| | Screenshot |
|---|---|
| Before (ranked — `TagList` / `ActionButtons`) | `docs/assets/02-rn-perf/exercise-2-3-before.png` |
| Before (oś commitów, 2 / 51) | `docs/assets/02-rn-perf/exercise-2-3-before-commits.png` |
| After (ranked — badge **Memo ✨**, commit 19 / 143) | `docs/assets/02-rn-perf/exercise-2-3-after.png` |
| After (oś commitów; większość commitów to niskie paski) | `docs/assets/02-rn-perf/exercise-2-3-after-commits.png` |

**Rozwiązanie**

Włączenie React Compiler w Expo (`experiments.reactCompiler: true` w `apps/02-rn-perf/app.json`) — bez ręcznego `memo()` na całym feedzie.

**Wynik (after)**

Ten sam workflow (scroll + like). W DevTools widać **Memo ✨** przy `TagList`, `FeedItem`, `PostHeader`, ikonach itd. — compiler pominął re-render wierszy, których propsy się nie zmieniły. Commit after (~**51.6 ms** renderu dla tego wybranego momentu vs ~**204 ms** before na rankingu) ma krótszy ranked i mniej powtórzeń tych samych komponentów; na osi commitów (143 w sesji) większość pasków to niskie, zielone commity zamiast gęstego żółtego „szumu” przy każdym like.

---

### Exercise 3 — `Activity` + `useTransition` (`PostDetailRelatedPosts`)

**Problem**

Footer `PostDetailRelatedPosts` (`findRelatedPosts`) wchodzi w pierwszy paint ekranu szczegółu. W Performance widać długi **blocking Render** na `PostDetailScreen` i czerwony pasek `PostDetailRelatedPosts` w tym samym oknie co mount listy.

**Workflow**

Wejście na `post/[id]` (Performance tab, CPU / Scheduler / Components).

**Porównanie**

| Podejście | Co robi | Trace |
|---|---|---|
| Lazy + `Activity` | `React.lazy` + `Suspense` na footerze | `docs/assets/02-rn-perf/exercise-3-lazy-activity.png` — self time **Render ~379 ms**, obok **Promise Resolved ~217 ms** (ładowanie chunka), `Update Blocked` przed ciężkim renderem, `PostDetailRelatedPosts` nadal na ścieżce CPU |
| Domyślnie | Footer w `ListFooterComponent` od razu | `docs/assets/02-rn-perf/exercise-3-default.png` — mount `PostDetailScreen` i **czerwony `PostDetailRelatedPosts` w tym samym blocking renderze** co `FlatList` |
| `Activity` + `startTransition` (`useEffect`) | Hook odkłada mount: pierwszy paint bez footera, potem `hidden`, potem `visible` na priorytecie transition | `docs/assets/02-rn-perf/exercise-3-activity-transition.png` — pierwszy paint krótszy; `PostDetailRelatedPosts` + `Reconnect` schodzą na późniejszy render (~741 ms zaznaczenie CPU), po `Update Blocked` |

**Implementacja (wariant wybrany)**

`apps/02-rn-perf/src/hooks/use-deferred-mount-activity-props.ts`:

```ts
export function useDeferredMountActivityProps(): ActivityProps | null {
  const [mode, setMode] = useState<ActivityMode | null>(null);

  useEffect(() => {
    startTransition(() => {
      setMode("hidden");
    });
  }, []);

  useEffect(() => {
    if (mode !== "hidden") return;

    startTransition(() => {
      setMode("visible");
    });
  }, [mode]);

  return mode === null ? null : { mode };
}
```

W `post/[id].tsx` footer jest `undefined`, dopóki hook zwraca `null`. Potem:

```tsx
<Activity {...relatedActivityProps}>
  <PostDetailRelatedPosts post={post} />
</Activity>
```

`mode="hidden"` pre-renderuje drzewo poza ekranem (React `Activity` trzyma stan, bez pokazywania), `mode="visible"` je odsłania. Oba `setMode` idą przez `startTransition`, więc nie blokują pierwszego interaktywnego paintu ekranu posta. Warianty lazy/`Suspense` i „zawsze w footerze” zostały w pliku jako zakomentowane porównanie.

---

### Exercise 3.2 — transitions i deferred values (wejście na feed)

**Problem**

Pierwszy render taba Home montował cały widoczny feed synchronicznie: `toSlimFeed(MOCK_FEED)` było w `useState` initializerze, więc jeden commit ciągnął dziesiątki `TagList` / `ActionButtons` / `PostHeader`.

**Implementacja**

- `apps/02-rn-perf/src/app/(tabs)/index.tsx` — lista startuje pusta; hydracja mocka idzie w `useEffect` + `startTransition`, żeby ciężki mount feedu nie blokował pierwszej klatki shella (header, tab bar, `Content`).
- `ActionButtons` — `useDeferredValue(likes)` zasila `computeEngagementRate`, więc drogie liczenie engagementu może zostać w tyle za tapem like, zamiast wydłużać ten sam commit.
- React Compiler (`experiments.reactCompiler`, commit `6a1e561`) memoizuje wiersze, których propsy się nie zmieniły.

**Profiler — pierwszy render `Content` (ten sam typ commitu)**

| | Screenshot |
|---|---|
| Before | `docs/assets/02-rn-perf/exercise-3-2-before.png` |
| After | `docs/assets/02-rn-perf/exercise-3-2-after.png` |

| Metryka | Przed | Po |
|---|---|---|
| Czas commitu (zaznaczony w prawym panelu) | ~197 ms (2.4 s) | ~56 ms (2.3 s) |
| `Content` (self-time) | 4.7 ms | 4.5 ms |
| Drugi commit w okolicy | ~15 ms (2.5 s) | ~14 ms (2.3 s) |

Różnica to ok. **3.5×** krótszy pierwszy ciężki commit (~140 ms mniej). To realny zysk na UX: mniej pracy w jednej klatce przy wejściu na tab.

**Co widać w drzewie**

Przed: w Ranked wiele kopii `TagList`, `ActionButtons`, `PostHeader`, `CommentIcon` — mount całego widocznego feedu wiersz po wierszu.

Po: lista krótsza i płytsza; `FeedList` ze ✨ (React Compiler), mniej powtarzalnych liści w TOP rankingu. Self-time `Content` prawie bez zmian — wygrało poddrzewo (lista + wiersze), nie slot nawigacji.

**Jak to czytać**

- `Content` ~4.5–4.7 ms — szum / ten sam poziom nawigacji; sukcesu fixu nie mierzy się tutaj.
- Commit ~197 → ~56 ms — tu widać, że odłożenie hydracji feedu (`startTransition`) i compiler na wierszach skracają wejście na listę.

---

### Exercise 4 — list performance, dźwignia „draw less” (+ ciaśniejsze okno FlatList)

Budżet klatki to **16 ms** przy 60 fps (8 ms przy 120). Ten diff (niezacommitowany) pokrywa z briefu list performance **Lever 1** w całości i kawałek **Lever 3 / Exercise 3.1**. Lever 2 (stabilne klucze, stan like w wierszu, profiler, `memo`) oraz FlashList (`getItemType`, `getMappingKey`, zagnieżdżony carousel) **nie wchodzą** w ten diff.

Bilans plików: **21** zmienionych w git, **−528 / +91** linii, plus nowy `feed-image.tsx`. Usunięte **9** plików (6 ikon SVG + 3 shimmery).

#### 1.1 — `expo-image` zamiast `Image` z `react-native`

**Do zrobienia:** każdy zdalny obraz w feedzie przez `expo-image`, w rozdzielczości bliskiej temu, co widać na ekranie (punkty × pixel ratio).

**Zrobione:** jeden wrapper `FeedImage` + `displaySource(uri, widthPoints, heightPoints)`. `displaySource` ustawia `width` / `height` źródła na `Math.round(points * PixelRatio.get())`, żeby dekoder nie brał pełnej bitmapy pod avatar 20–36 px. **8** wywołań `FeedImage`:

| Miejsce | Rozmiar w punktach |
|---|---|
| `carousel-image` | 400 × 400 / aspect |
| `post-detail-related-posts` | 140 × 140 |
| `suggested-post-card` zdjęcie | 160 × 160 |
| `post-detail-header` avatar | 36 × 36 |
| `comment-item` avatar | 36 albo 28 (reply) |
| `post-header` avatar | 32 × 32 |
| `comment-preview` avatar | 28 × 28 |
| `suggested-post-card` avatar | 20 × 20 |

Logo w `feed-header` to lokalny asset przez `Image` z `expo-image` (nie idzie przez `displaySource`).

#### 1.2 — shimmer precz, blurhash

**Do zrobienia:** wywalić `ImageWithShimmer` i cały `src/components/feed/shimmer/`, placeholder to blurhash w `expo-image`.

**Zrobione:** skasowane **3** pliki (`shimmer-view.tsx` z pętlą `Animated` **bez** native drivera, `image-shimmer.tsx`, `image-with-shimmer.tsx`). `FeedImage` zawsze dostaje `placeholder={{ blurhash: DEFAULT_BLURHASH }}`, `contentFit="cover"`, crossfade `transition={200}`. **5** dawnych `ImageWithShimmer` (karuzela, avatar w nagłówku posta, preview komentarza, zdjęcie i avatar suggested) plus **3** surowe `Image` z RN (avatar w detalu, avatar komentarza, miniatura related) idą teraz przez ten sam komponent.

#### 1.3 — SVG → `IconSymbol`

**Do zrobienia:** serce, komentarz, share, bookmark, menu, verified, pin — SF Symbol / Material zamiast `react-native-svg`.

**Zrobione:** skasowany katalog `icons/` — **6** komponentów (`heart`, `comment`, `share`, `bookmark`, `verified`, `menu`; sam `menu-icon` to 154 linie ścieżek). W `icon-symbol.tsx` doszło **10** wpisów `MAPPING` (`person`, `checkmark.seal.fill`, `calendar`, `ellipsis`, `mappin`, `bell`, `link`, `square.and.arrow.up`, `eye.slash`, `flag`). Podmiany w wierszu:

- pasek akcji: `heart` / `heart.fill`, `bubble.right`, `paperplane` (`action-buttons`)
- serce w `comment-preview`
- nagłówek posta i detal: `checkmark.seal.fill`, `mappin` (zamiast kropki), `ellipsis` (zamiast tekstu `•••`)
- menu opcji: **6** ikon przez `MENU_SYMBOLS` (`bell`, `link`, `square.and.arrow.up`, `person`, `eye.slash`, `flag`)

`LikeButton` / `ShareButton` / `BookmarkButton` już wcześniej siedziały na `IconSymbol` — ten diff ich nie tyka.

#### 3.1 — okno FlatList (nie defaults)

Brief mówi: bez pomiaru zostaw defaults. Tu świadomie ściągnęliśmy okno, bo wiersz to ciężki post (~1 na viewport), nie cienki wiersz:

| Prop | Było | Jest |
|---|---|---|
| `windowSize` | 21 | **5** |
| `maxToRenderPerBatch` | 10 | **2** |
| `initialNumToRender` | 5 | **2** |
