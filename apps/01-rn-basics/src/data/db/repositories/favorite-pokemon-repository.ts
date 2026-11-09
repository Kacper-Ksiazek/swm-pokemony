import { gt } from "drizzle-orm";

import { db } from "../client";
import { favoritePokemon, type NewFavoritePokemon } from "../schema";

// id 0 is a storage placeholder after clear (not a real Pokémon). Real favorites use id >= 1.
const CLEARED_PLACEHOLDER: NewFavoritePokemon = { id: 0, name: "" };

// At most one visible favorite. Pass to useLiveQuery in useLiveFavoritePokemon.
export function favoritePokemonQuery() {
  return db.select().from(favoritePokemon).where(gt(favoritePokemon.id, 0)).limit(1);
}

// Replaces any existing favorite, so the table never holds more than one row.
// The Expo SQLite session does not wait for an async transaction callback, so the
// writes stay synchronous and finish before the transaction commits.
export function setFavoritePokemon(pokemon: NewFavoritePokemon): void {
  db.transaction((tx) => {
    tx.delete(favoritePokemon).run();
    tx.insert(favoritePokemon).values(pokemon).run();
  });
}

// delete-only writes trigger one useLiveQuery refresh that can still see the old row.
// Match setFavoritePokemon: delete then insert, but keep a placeholder row the query ignores.
export function clearFavoritePokemon(): void {
  db.transaction((tx) => {
    tx.delete(favoritePokemon).run();
    tx.insert(favoritePokemon).values(CLEARED_PLACEHOLDER).run();
  });
}
