import { useLiveQuery } from "drizzle-orm/expo-sqlite";

import { mapPinsQuery } from "@/data/db";

export function useMapPins() {
  const { data } = useLiveQuery(mapPinsQuery());

  return {
    pins: data ?? [],
  };
}
