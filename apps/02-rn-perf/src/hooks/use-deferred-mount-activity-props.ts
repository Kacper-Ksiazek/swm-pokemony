import { type Activity, type ComponentProps, startTransition, useEffect, useState } from "react";

export type ActivityProps = Pick<ComponentProps<typeof Activity>, "mode">;

type ActivityMode = NonNullable<ActivityProps["mode"]>;

/**
 * Defers mounting heavy off-screen UI: skips the first paint, pre-renders in a hidden
 * Activity at transition priority, then reveals it.
 */
export function useDeferredMountActivityProps(): ActivityProps | null {
  const [mode, setMode] = useState<ActivityMode | null>(null);

  useEffect(() => {
    startTransition(() => {
      setMode("hidden");
    });
  }, []);

  useEffect(() => {
    if (mode !== "hidden") return;

    startTransition(() => {
      setMode("visible");
    });
  }, [mode]);

  return mode === null ? null : { mode };
}
