export const LANE_COUNT = 6;
export const PLAYER_Y_NORM = 0.77;
export const PLAYER_CAR_WIDTH_NORM = 0.095;
export const PLAYER_CAR_HEIGHT_NORM = 0.18;

export const ROAD_MIN_X = 0.08;
export const ROAD_MAX_X = 0.92;

export function getLaneCenterX(lane: number): number {
  "worklet";

  return (lane + 0.5) / LANE_COUNT;
}
