# Strict TypeScript

`tsconfig.json` sets `"strict": true` (TypeScript `~6.0.3`, extending `expo/tsconfig.base`). Leave that flag on. Use `any` only when a boundary forces it, such as an untyped third-party value, and put the reason on that line.

## Good

```ts
type PokemonListItem = {
  name: string;
  url: string;
};

function readName(item: PokemonListItem): string {
  return item.name;
}
```

## Bad

```ts
// tsconfig.json
"strict": false,

function readName(item: any): string {
  return item.name;
}
```
