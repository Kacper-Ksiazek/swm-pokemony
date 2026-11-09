import { integer, sqliteTable, text } from "drizzle-orm/sqlite-core";

// The app keeps one favorite at a time. The repository enforces a single row.
export const favoritePokemon = sqliteTable("favorite_pokemon", {
  id: integer("id").primaryKey(),
  name: text("name").notNull(),
});

export type FavoritePokemon = typeof favoritePokemon.$inferSelect;
export type NewFavoritePokemon = typeof favoritePokemon.$inferInsert;
