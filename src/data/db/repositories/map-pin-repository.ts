import { eq, gt } from "drizzle-orm";

import { db } from "../client";
import { mapPin, type NewMapPin } from "../schema";

// id 0 stays in the table so a delete is followed by another write.
// useLiveQuery can miss a delete-only change and keep showing the old row.
// The placeholder name changes on each delete. The pin query ignores id 0.
const PIN_SENTINEL: NewMapPin = {
  id: 0,
  pokemonId: 0,
  name: "",
  latitude: 0,
  longitude: 0,
};

export function mapPinsQuery() {
  return db.select().from(mapPin).where(gt(mapPin.id, 0));
}

export function insertMapPin(pin: NewMapPin): void {
  if (pin.pokemonId <= 0) {
    return;
  }

  db.transaction((tx) => {
    tx.insert(mapPin).values(PIN_SENTINEL).onConflictDoNothing().run();
    tx.insert(mapPin)
      .values({
        pokemonId: pin.pokemonId,
        name: pin.name,
        latitude: pin.latitude,
        longitude: pin.longitude,
      })
      .run();
  });
}

export function deleteMapPin(id: number): void {
  if (id <= 0) {
    return;
  }

  db.transaction((tx) => {
    tx.delete(mapPin).where(eq(mapPin.id, id)).run();
    const touch = String(Date.now());
    tx.insert(mapPin)
      .values({ ...PIN_SENTINEL, name: touch })
      .onConflictDoUpdate({
        target: mapPin.id,
        set: { name: touch },
      })
      .run();
  });
}
