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
