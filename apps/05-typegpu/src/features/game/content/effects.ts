/**
 * Everything a card, event or tile can do, as plain data. `engine/apply-effects.ts` is the only
 * code that interprets these, so adding a card or event never needs new logic.
 *
 * "Actor" is the player whose turn it is. "Target" is another player the actor picks in the modal.
 */
export type Effect =
  /** Actor gains (positive) or pays (negative) money. */
  | { type: "money"; amount: number }
  /** Money per child the actor has (e.g. school fees). */
  | { type: "moneyPerChild"; amount: number }
  /** Money per pet the actor has (e.g. vet bills). */
  | { type: "moneyPerPet"; amount: number }
  /** Actor collects their salary now, times `multiplier`. */
  | { type: "salary"; multiplier: number }
  /** Actor's salary changes permanently. Does nothing without a career. */
  | { type: "salaryRaise"; amount: number }
  | { type: "addChildren"; count: number }
  | { type: "addPet" }
  /** Every other player pays the actor. */
  | { type: "collectFromOthers"; amount: number }
  /** The actor pays every other player. */
  | { type: "payOthers"; amount: number }
  /** Target pays the actor. */
  | { type: "takeFromTarget"; amount: number }
  /** Actor pays the target. */
  | { type: "giveToTarget"; amount: number }
  /** Actor and target swap tiles. */
  | { type: "swapWithTarget" }
  /** Target loses their next turn. */
  | { type: "targetSkipsTurn" }
  /** Actor drives on this many tiles (forks still ask; stop tiles still stop). */
  | { type: "moveForward"; steps: number }
  /** Actor spins again right after this turn. */
  | { type: "extraSpin" }
  /** Actor loses their next turn. */
  | { type: "skipNextTurn" };

const TARGET_EFFECTS = new Set<Effect["type"]>([
  "takeFromTarget",
  "giveToTarget",
  "swapWithTarget",
  "targetSkipsTurn",
]);

/** True when the effects need the actor to pick another player first. */
export function needsTarget(effects: Effect[]) {
  return effects.some((effect) => TARGET_EFFECTS.has(effect.type));
}
