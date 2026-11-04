import { getTableName } from "drizzle-orm";
import { addDatabaseChangeListener } from "expo-sqlite";
import { useEffect, useState } from "react";

import { type FavoritePokemon, favoritePokemon, favoritePokemonQuery } from "@/data/db";

const FAVORITE_TABLE = getTableName(favoritePokemon);

// useLiveQuery reads inside SQLite's update hook, while the write statement is still
// running. A delete-only write then gets stored as the previous row. Refreshing on the
// next turn runs the select after that statement has finished.
export function useLiveFavoritePokemon() {
  const [favorite, setFavorite] = useState<FavoritePokemon | null>(null);
  const [loaded, setLoaded] = useState(false);

  useEffect(() => {
    let active = true;

    const refresh = () => {
      favoritePokemonQuery()
        .then((rows) => {
          if (!active) {
            return;
          }
          setFavorite(rows[0] ?? null);
          setLoaded(true);
        })
        .catch(() => {
          if (!active) {
            return;
          }
          setLoaded(true);
        });
    };

    refresh();

    const subscription = addDatabaseChangeListener((event) => {
      if (event.tableName !== FAVORITE_TABLE) {
        return;
      }
      setTimeout(refresh, 0);
    });

    return () => {
      active = false;
      subscription.remove();
    };
  }, []);

  return { favorite, loaded };
}
