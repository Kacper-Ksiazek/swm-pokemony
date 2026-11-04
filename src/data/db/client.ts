import { drizzle } from "drizzle-orm/expo-sqlite";
import { openDatabaseSync } from "expo-sqlite";

import { DB_NAME } from "./constants";
import * as schema from "./schema";

// The change listener powers drizzle's useLiveQuery, so screens re-render on writes.
const sqlite = openDatabaseSync(DB_NAME, { enableChangeListener: true });

export const db = drizzle(sqlite, { schema });
