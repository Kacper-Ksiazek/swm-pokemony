# Path aliases

Import in-repo modules with `@/`. `tsconfig.json` maps `@/*` to `./src/*` and `@/assets/*` to `./assets/*`. Reach assets through `@/assets/`. Keep imports on the alias when the file lives several folders away.

## Good

```ts
import { PokemonListScreen } from "@/features/pokemon-list";
import icon from "@/assets/images/icon.png";
```

## Bad

```ts
import { PokemonListScreen } from "../../features/pokemon-list";
import icon from "../../../assets/images/icon.png";
```
