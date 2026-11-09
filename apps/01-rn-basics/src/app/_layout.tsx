import { useMigrations } from "drizzle-orm/expo-sqlite/migrator";
import { reloadAppAsync } from "expo";
import { NativeTabs } from "expo-router/native-tabs";
import * as SplashScreen from "expo-splash-screen";
import { useEffect } from "react";

import { db } from "@/data/db";
import migrations from "@/data/db/migrations/migrations";
import { ErrorStatusScreen } from "@/shared/components/status-screen";
import { COLORS } from "@/shared/styles/colors";

SplashScreen.preventAutoHideAsync();

export default function RootLayout() {
  const { success, error } = useMigrations(db, migrations);

  useEffect(() => {
    if (success || error) {
      SplashScreen.hideAsync();
    }
  }, [success, error]);

  if (error) {
    return (
      <ErrorStatusScreen
        title="Could not open the database"
        message="The local database could not be opened."
        detail={__DEV__ ? error.message : undefined}
        onRetry={() => reloadAppAsync()}
        retryLabel="Restart app"
      />
    );
  }

  if (!success) {
    return null;
  }

  return (
    <NativeTabs tintColor={COLORS.PRIMARY}>
      <NativeTabs.Trigger name="(pokemon-list)">
        <NativeTabs.Trigger.Label>List</NativeTabs.Trigger.Label>
        <NativeTabs.Trigger.Icon sf="list.bullet" md="format_list_bulleted" />
      </NativeTabs.Trigger>
      <NativeTabs.Trigger name="pokemon-favorite">
        <NativeTabs.Trigger.Label>Favorite</NativeTabs.Trigger.Label>
        <NativeTabs.Trigger.Icon sf="heart.fill" md="favorite" />
      </NativeTabs.Trigger>
      <NativeTabs.Trigger name="pokemon-map">
        <NativeTabs.Trigger.Label>Map</NativeTabs.Trigger.Label>
        <NativeTabs.Trigger.Icon sf="map.fill" md="map" />
      </NativeTabs.Trigger>
      <NativeTabs.Trigger name="camera">
        <NativeTabs.Trigger.Label>Camera</NativeTabs.Trigger.Label>
        <NativeTabs.Trigger.Icon sf="camera.fill" md="photo_camera" />
      </NativeTabs.Trigger>
    </NativeTabs>
  );
}
