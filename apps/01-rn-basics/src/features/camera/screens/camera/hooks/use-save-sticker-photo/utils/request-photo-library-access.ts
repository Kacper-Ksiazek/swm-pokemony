import { openSettings } from "expo-linking";
import { requestPermissionsAsync } from "expo-media-library";

export async function requestPhotoLibraryAccess(): Promise<boolean> {
  const permission = await requestPermissionsAsync(true, ["photo"]);

  if (permission.status !== "granted") {
    if (!permission.canAskAgain) {
      openSettings();
    }

    return false;
  }

  return true;
}
