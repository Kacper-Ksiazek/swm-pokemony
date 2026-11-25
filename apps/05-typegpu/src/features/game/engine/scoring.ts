import { CHILD_POINTS, PET_POINTS } from "../content/rules";
import { HOUSES_BY_ID } from "../content/houses";
import type { Player } from "./types";

/** Final score breakdown. Retirement bonuses are already in `money`. */
export function scorePlayer(player: Player) {
  const house = player.houseId ? HOUSES_BY_ID[player.houseId].value : 0;
  const children = player.children * CHILD_POINTS;
  const pets = player.pets * PET_POINTS;

  return {
    money: player.money,
    house,
    children,
    pets,
    total: player.money + house + children + pets,
  };
}
