import { useEffect } from "react";

import { useGameStore } from "../../../store/game-store";

/** Time between two tiles while a pawn is moving. */
const STEP_INTERVAL_MS = 420;

/** While the current pawn is moving, advances it one tile at a time. */
export function useTurnRunner() {
  const status = useGameStore((state) => state.status);
  const step = useGameStore((state) => state.step);

  useEffect(() => {
    if (status !== "moving") {
      return;
    }

    const interval = setInterval(step, STEP_INTERVAL_MS);

    return () => clearInterval(interval);
  }, [status, step]);
}
