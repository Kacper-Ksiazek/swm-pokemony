import { NativeTabs } from "expo-router/native-tabs";
import * as SplashScreen from "expo-splash-screen";
import { useEffect } from "react";

SplashScreen.preventAutoHideAsync();

export default function RootLayout() {
  useEffect(() => {
    SplashScreen.hideAsync();
  }, []);

  return (
    <NativeTabs>
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
