import { useRef, useState } from "react";
import { useWindowDimensions } from "react-native";
import type { ViewShotRef } from "react-native-view-shot";
import { usePhotoOutput } from "react-native-vision-camera";

import type {
  PendingPhoto,
  ReadyHandlers,
  UseSaveStickerPhotoParams,
  UseSaveStickerPhotoResult,
} from "./use-save-sticker-photo.types";
import {
  captureRawPhotoWithSticker,
  FAILED,
  LIBRARY_OFF,
  LOOK_AT_CAMERA,
  requestPhotoLibraryAccess,
  SAVED,
  saveComposedShotToGallery,
  waitForComposition,
} from "./utils";

export function useSaveStickerPhoto({
  frame,
  previewWidth,
  previewHeight,
  previewSize,
  facing,
}: UseSaveStickerPhotoParams): UseSaveStickerPhotoResult {
  const window = useWindowDimensions();
  const photoOutput = usePhotoOutput({
    targetResolution: {
      width: previewSize.width > 0 ? previewSize.width : window.width,
      height: previewSize.height > 0 ? previewSize.height : window.height,
    },
  });

  const savingRef = useRef(false);
  const shotRef = useRef<ViewShotRef>(null);
  const readyRef = useRef<ReadyHandlers | null>(null);

  const [saving, setSaving] = useState(false);
  const [status, setStatus] = useState<string | null>(null);
  const [pending, setPending] = useState<PendingPhoto | null>(null);

  function onCompositionReady() {
    readyRef.current?.resolve();
  }

  function onCompositionFailed() {
    readyRef.current?.reject(new Error(FAILED));
  }

  async function save() {
    if (savingRef.current) {
      return;
    }

    if (frame.get() == null) {
      setStatus(LOOK_AT_CAMERA);
      return;
    }

    savingRef.current = true;
    setSaving(true);
    setStatus(null);

    try {
      const hasAccess = await requestPhotoLibraryAccess();

      if (!hasAccess) {
        setStatus(LIBRARY_OFF);

        return;
      }

      const rawPhoto = await captureRawPhotoWithSticker({
        photoOutput,
        frame,
        previewWidth,
        previewHeight,
        facing,
      });

      if (rawPhoto == null) {
        setStatus(LOOK_AT_CAMERA);

        return;
      }

      const composed = waitForComposition(readyRef);
      setPending(rawPhoto);

      await composed;

      const saved = await saveComposedShotToGallery(shotRef);
      setStatus(saved ? SAVED : FAILED);
    } catch (error) {
      if (__DEV__) {
        console.log("[camera] save failed", error);
      }

      setStatus(FAILED);
    } finally {
      savingRef.current = false;
      setSaving(false);
      setPending(null);
    }
  }

  return {
    photoOutput,
    shotRef,
    pending,
    saving,
    status,
    save,
    onCompositionReady,
    onCompositionFailed,
  };
}
