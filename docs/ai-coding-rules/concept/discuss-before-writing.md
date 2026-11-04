# Discuss before writing

Compare approaches and their trade-offs before writing. Do not start a feature until the owner picks an approach and can explain the mechanism. Extra ideas, including animations, wait for that choice. Navigation library and which detail fields to show are mentor calls; this repo already uses Expo Router.

## Good

```text
Agent: A Pokémon list can page with FlatList onEndReached, or with a cursor the screen stores.
onEndReached is shorter. A cursor is easier to explain when a request fails.
Which approach do you want? I will not add the screen until you pick.
```

## Bad

```tsx
// Started the list before the owner chose how paging works.
export default function PokemonListScreen() {
  return <FlatList data={pages.flat()} onEndReached={fetchNextPage} />;
}
```
