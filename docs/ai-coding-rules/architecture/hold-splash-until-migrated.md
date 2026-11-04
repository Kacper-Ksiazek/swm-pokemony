# Hold the splash screen until migrations finish

Once the first table exists, the root layout runs drizzle's `useMigrations` and keeps the splash screen visible until it reports `success`. Nothing renders, and no query runs, before that. On `error`, render an error status screen instead of the tabs.

This rule applies from the first migration on. Until `src/data/db/migrations/` exists there is nothing to run, so `src/app/_layout.tsx` stays as it is.

## Good

```tsx
// src/app/_layout.tsx
import { db } from "@/data/db";
import { useMigrations } from "drizzle-orm/expo-sqlite/migrator";
import migrations from "@/data/db/migrations/migrations";

SplashScreen.preventAutoHideAsync();

export default function RootLayout() {
  const { success, error } = useMigrations(db, migrations);

  useEffect(() => {
    if (success || error) SplashScreen.hideAsync();
  }, [success, error]);

  if (error) return <ErrorStatusScreen />;
  if (!success) return null;

  return <NativeTabs>{/* ... */}</NativeTabs>;
}
```

## Bad

```tsx
// Hiding the splash before the database is ready
useEffect(() => {
  SplashScreen.hideAsync();
}, []);
```

```tsx
// Querying in a screen without waiting for migrations
const favorites = await getFavorites();
```
