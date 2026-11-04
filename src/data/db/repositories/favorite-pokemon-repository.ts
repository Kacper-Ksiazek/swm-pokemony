import { db } from "../client";
import { favoritePokemon, type NewFavoritePokemon } from "../schema";

// Pass to drizzle's useLiveQuery. Resolves to an array with at most one row.
export function favoritePokemonQuery() {
  return db.select().from(favoritePokemon).limit(1);
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

export function clearFavoritePokemon(): void {
  db.delete(favoritePokemon).run();
}
