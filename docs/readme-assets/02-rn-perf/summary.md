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
