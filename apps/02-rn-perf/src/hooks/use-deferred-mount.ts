import { startTransition, useEffect, useState } from "react";

/**
 * After the first paint, flips to true inside a transition so heavy footer UI can mount later.
 */
export function useDeferredMount(): boolean {
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    startTransition(() => {
      setMounted(true);
    });
  }, []);

  return mounted;
}
