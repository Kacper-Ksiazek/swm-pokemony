import type { Dispatch, RefObject, SetStateAction } from "react";

import type { FaceScanDebug } from "../../../devtools";

const DEBUG_FLUSH_INTERVAL_MS = 250;

type FlushDebugArgs = {
  next: FaceScanDebug;
  immediate?: boolean;
  debugRef: RefObject<FaceScanDebug>;
  flushTimer: RefObject<ReturnType<typeof setTimeout> | null>;
  setDebug: Dispatch<SetStateAction<FaceScanDebug>>;
};

export function flushDebugState({
  next,
  immediate = false,
  debugRef,
  flushTimer,
  setDebug,
}: FlushDebugArgs) {
  debugRef.current = next;

  if (!__DEV__) {
    return;
  }

  if (immediate) {
    if (flushTimer.current != null) {
      clearTimeout(flushTimer.current);
      flushTimer.current = null;
    }
    setDebug(next);
    return;
  }

  if (flushTimer.current != null) {
    return;
  }

  flushTimer.current = setTimeout(() => {
    flushTimer.current = null;
    setDebug(debugRef.current);
  }, DEBUG_FLUSH_INTERVAL_MS);
}
