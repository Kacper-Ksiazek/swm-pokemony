import { useEffect } from "react";

export function useElapsedGameTime(isGameOver: boolean, onTick: () => void) {
  useEffect(() => {
    if (isGameOver) {
      return;
    }

    const interval = setInterval(onTick, 1000);

    return () => clearInterval(interval);
  }, [isGameOver, onTick]);
}
