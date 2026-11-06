import type { RefObject } from "react";

import type { ReadyHandlers } from "../use-save-sticker-photo.types";
import { FAILED } from "./constants";

const COMPOSITION_TIMEOUT_MS = 8000;

export function waitForComposition(readyRef: RefObject<ReadyHandlers | null>): Promise<void> {
  return new Promise<void>((resolve, reject) => {
    const timeout = setTimeout(() => {
      readyRef.current = null;
      reject(new Error(FAILED));
    }, COMPOSITION_TIMEOUT_MS);

    readyRef.current = {
      resolve: () => {
        clearTimeout(timeout);
        readyRef.current = null;
        resolve();
      },

      reject: (error) => {
        clearTimeout(timeout);
        readyRef.current = null;
        reject(error);
      },
    };
  });
}
