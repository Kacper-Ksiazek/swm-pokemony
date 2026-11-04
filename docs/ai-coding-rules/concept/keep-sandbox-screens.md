# Product tabs

The tab bar is four tabs. The feature folder name is not the tab title. List is the landing tab: its route group is `(pokemon-list)`, so the URL is `/`, and the `NativeTabs.Trigger` name is `(pokemon-list)`.

| Feature | Tab title | Trigger name |
|---|---|---|
| `pokemon-list` | List | `(pokemon-list)` |
| `pokemon-favorite` | Favorite | `pokemon-favorite` |
| `pokemon-map` | Map | `pokemon-map` |
| `camera` | Camera | `camera` |

## Good

```tsx
<NativeTabs.Trigger name="(pokemon-list)">
  <NativeTabs.Trigger.Label>List</NativeTabs.Trigger.Label>
  <NativeTabs.Trigger.Icon sf="list.bullet" md="format_list_bulleted" />
</NativeTabs.Trigger>
<NativeTabs.Trigger name="pokemon-favorite">
  <NativeTabs.Trigger.Label>Favorite</NativeTabs.Trigger.Label>
  <NativeTabs.Trigger.Icon sf="heart.fill" md="favorite" />
</NativeTabs.Trigger>
```

## Bad

```tsx
<NativeTabs.Trigger name="pokemon-list">
  <NativeTabs.Trigger.Label>Pokémon list</NativeTabs.Trigger.Label>
</NativeTabs.Trigger>
<NativeTabs.Trigger name="index">
  <NativeTabs.Trigger.Label>Screen A</NativeTabs.Trigger.Label>
</NativeTabs.Trigger>
```
