import type { Effect } from "../content/effects";
import { formatMoney, formatMoneyChange } from "../utils/format-money";
import type { EngineState, Player } from "./types";

type Result = { state: EngineState; lines: string[] };

/**
 * Applies effects for the current player (the actor). `targetIndex` is the player picked in the
 * modal for target effects. Returns the new state and one Polish line per visible change, which
 * the modal lists under the card or event.
 */
export function applyEffects(
  state: EngineState,
  effects: Effect[],
  targetIndex: number | null = null,
): Result {
  const players: Player[] = state.players.map((player) => ({ ...player }));
  const actor = players[state.currentIndex];
  const target = targetIndex === null ? null : players[targetIndex];
  const others = players.filter((player) => player !== actor);
  const lines: string[] = [];
  let { pendingSteps, extraSpin } = state;

  const pay = (from: Player, to: Player, amount: number) => {
    from.money -= amount;
    to.money += amount;
  };

  for (const effect of effects) {
    switch (effect.type) {
      case "money":
        actor.money += effect.amount;
        lines.push(formatMoneyChange(effect.amount));
        break;
      case "moneyPerChild": {
        const total = effect.amount * actor.children;

        actor.money += total;
        lines.push(
          actor.children === 0 ? "Nie masz dzieci, nic się nie zmienia" : formatMoneyChange(total),
        );
        break;
      }
      case "moneyPerPet": {
        const total = effect.amount * actor.pets;

        actor.money += total;
        lines.push(
          actor.pets === 0 ? "Nie masz zwierzaków, nic się nie zmienia" : formatMoneyChange(total),
        );
        break;
      }
      case "salary": {
        const total = actor.salary * effect.multiplier;

        actor.money += total;
        lines.push(
          actor.salary === 0 ? "Bez pracy nie ma pensji" : `Pensja: ${formatMoneyChange(total)}`,
        );
        break;
      }
      case "salaryRaise":
        if (actor.careerId) {
          actor.salary += effect.amount;
          lines.push(`Nowa pensja: ${formatMoney(actor.salary)}`);
        } else {
          lines.push("Najpierw musisz mieć pracę");
        }
        break;
      case "addChildren":
        actor.children += effect.count;
        lines.push(effect.count === 1 ? "+1 dziecko" : `+${effect.count} dzieci`);
        break;
      case "addPet":
        actor.pets += 1;
        lines.push("+1 zwierzak");
        break;
      case "collectFromOthers":
        others.forEach((other) => pay(other, actor, effect.amount));
        lines.push(
          others.length === 0
            ? "Nie ma innych graczy"
            : `Od każdego gracza: ${formatMoneyChange(effect.amount)}`,
        );
        break;
      case "payOthers":
        others.forEach((other) => pay(actor, other, effect.amount));
        lines.push(
          others.length === 0
            ? "Nie ma innych graczy"
            : `Dla każdego gracza: ${formatMoney(effect.amount)}`,
        );
        break;
      case "takeFromTarget":
        if (target) {
          pay(target, actor, effect.amount);
          lines.push(`${target.name} płaci ci ${formatMoney(effect.amount)}`);
        }
        break;
      case "giveToTarget":
        if (target) {
          pay(actor, target, effect.amount);
          lines.push(`Płacisz ${formatMoney(effect.amount)} dla: ${target.name}`);
        }
        break;
      case "swapWithTarget":
        if (target) {
          [actor.tileId, target.tileId] = [target.tileId, actor.tileId];
          lines.push(`Zamieniasz się miejscami z: ${target.name}`);
        }
        break;
      case "targetSkipsTurn":
        if (target) {
          target.skipNextTurn = true;
          lines.push(`${target.name} traci następną kolejkę`);
        }
        break;
      case "moveForward":
        pendingSteps += effect.steps;
        lines.push(`Jedziesz ${effect.steps} pola dalej`);
        break;
      case "extraSpin":
        extraSpin = true;
        lines.push("Dodatkowy obrót kołem");
        break;
      case "skipNextTurn":
        actor.skipNextTurn = true;
        lines.push("Tracisz następną kolejkę");
        break;
    }
  }

  return { state: { ...state, players, pendingSteps, extraSpin }, lines };
}
