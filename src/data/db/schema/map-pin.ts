import { integer, real, sqliteTable, text } from "drizzle-orm/sqlite-core";

// One row per pin. id 0 is a storage placeholder, same idea as a cleared favorite.
export const mapPin = sqliteTable("map_pin", {
  id: integer("id").primaryKey({ autoIncrement: true }),
  pokemonId: integer("pokemon_id").notNull(),
  name: text("name").notNull(),
  latitude: real("latitude").notNull(),
  longitude: real("longitude").notNull(),
});

export type MapPin = typeof mapPin.$inferSelect;
export type NewMapPin = typeof mapPin.$inferInsert;
