# DB module layout

All local persistence lives in `src/data/db/` (expo-sqlite + drizzle, one file `pokemony.db`). Features import only from the barrel `@/data/db`, never from its inner files. The generated `migrations/` folder is never edited by hand.

| Path | Holds |
| --- | --- |
| `client.ts` | The single `db` instance (`openDatabaseSync` + `drizzle`) |
| `constants.ts` | `DB_NAME` |
| `schema/<table>.ts` | One table per file, plus its inferred `Select`/`Insert` types |
| `schema/index.ts` | Re-exports every table. drizzle-kit reads this folder |
| `repositories/<entity>-repository.ts` | Plain async query functions for one entity. No classes |
| `migrations/` | Output of `bun run db:generate`. Commit it |

After any schema change, run `bun run db:generate` and commit the result.

## Good

```ts
// src/data/db/schema/favorites.ts
import { integer, sqliteTable, text } from "drizzle-orm/sqlite-core";

export const favorites = sqliteTable("favorites", {
  id: integer("id").primaryKey(),
  name: text("name").notNull(),
});

export type Favorite = typeof favorites.$inferSelect;
```

```ts
// src/data/db/repositories/favorites-repository.ts
import { db } from "../client";
import { favorites } from "../schema";

export async function getFavorites() {
  return db.select().from(favorites);
}
```

```ts
// src/features/pokemon-favorite/screens/pokemon-favorite/hooks/use-favorite.ts
import { getFavorites } from "@/data/db";
```

## Bad

```ts
// Reaching into inner files
import { db } from "@/data/db/client";
```

```ts
// Opening a second connection in a feature
import { openDatabaseSync } from "expo-sqlite";
```

```ts
// Queries inside a component
export function PokemonListItem() {
  db.select().from(favorites);
}
```
