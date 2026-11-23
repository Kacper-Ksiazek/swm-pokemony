import { useEffect } from "react";

import type { GameOutcome } from "../../../../utils/chess-engine";
import { RESULT_SWITCH_DELAY_MS } from "../../../chess-screen.constants";

export function useDelayedResultReveal(
  outcome: GameOutcome | null,
  setShowResult: (show: boolean) => void,
) {
  useEffect(() => {
    if (!outcome) {
      setShowResult(false);
      return;
    }

    const timeout = setTimeout(() => setShowResult(true), RESULT_SWITCH_DELAY_MS);

    return () => clearTimeout(timeout);
  }, [outcome, setShowResult]);
}
