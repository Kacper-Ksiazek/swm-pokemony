import { useEffect } from "react";
import type { Dispatch, SetStateAction } from "react";
import type { SharedValue } from "react-native-reanimated";

import type { SpeedHudState } from "../../../sensors.types";
import { HUD_POLL_MS } from "../use-racing-game.constants";
import { resolvePedalState } from "../utils/resolve-pedal-state";

type UseSpeedHudPollParams = {
  isFocused: boolean;
  liveSpeedKmh: SharedValue<number>;
  brakePressed: SharedValue<boolean>;
  gasPressed: SharedValue<boolean>;
  lastPedal: SharedValue<"brake" | "gas">;
  setSpeedHud: Dispatch<SetStateAction<SpeedHudState>>;
};

/** Samples shared speed/pedals into React state for the speed HUD while the screen is focused. */
export function useSpeedHudPoll({
  isFocused,
  liveSpeedKmh,
  brakePressed,
  gasPressed,
  lastPedal,
  setSpeedHud,
}: UseSpeedHudPollParams) {
  useEffect(() => {
    if (!isFocused) {
      return;
    }

    const poll = () => {
      const speed = Math.round(liveSpeedKmh.get());
      const pedal = resolvePedalState(brakePressed.get(), gasPressed.get(), lastPedal.get());

      setSpeedHud((prev) =>
        prev.liveSpeedKmh === speed && prev.pedalState === pedal
          ? prev
          : { liveSpeedKmh: speed, pedalState: pedal },
      );
    };

    poll();
    const id = setInterval(poll, HUD_POLL_MS);

    return () => clearInterval(id);
  }, [brakePressed, gasPressed, isFocused, lastPedal, liveSpeedKmh, setSpeedHud]);
}
