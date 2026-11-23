import type { TileId } from "../blueprint";
import type { Effect } from "../content/effects";
import type { VehicleId } from "../vehicles";

export type Player = {
  id: number;
  name: string;
  vehicleId: VehicleId;
  color: string;
  tileId: TileId;
  finished: boolean;
  lastSpin: number | null;
  money: number;
  careerId: string | null;
  salary: number;
  hasDegree: boolean;
  houseId: string | null;
  children: number;
  pets: number;
  skipNextTurn: boolean;
};

/** How a notice card is colored in the modal. */
export type NoticeTone = "tile" | "card" | "event" | "payday" | "finish";

/**
 * One step the modal shows after a pawn stops. The store keeps them in a queue: the player
 * answers the first, the engine may add more, and the turn ends when the queue is empty.
 */
export type Prompt =
  /** Already applied; the player just reads it and taps "Dalej". */
  | {
      kind: "notice";
      tone: NoticeTone;
      emoji: string;
      title: string;
      body: string;
      lines: string[];
    }
  /** A card that needs another player picked before its effects apply. */
  | {
      kind: "choose-target";
      emoji: string;
      title: string;
      body: string;
      effects: Effect[];
      /** Indexes into `players` the actor may pick. */
      targets: number[];
    }
  /** Pick one of the offered careers, or keep the current one when `canKeep`. */
  | { kind: "career"; options: string[]; canKeep: boolean }
  /** Buy one of the offered houses, or skip. */
  | { kind: "house"; options: string[] };

/** The part of the game state the engine reads and writes. */
export type EngineState = {
  players: Player[];
  currentIndex: number;
  /** Action card ids, top of the deck last. */
  deck: string[];
  /** Tiles the current player still has to drive after a "move forward" effect. */
  pendingSteps: number;
  /** The current player spins again when the turn's prompts are done. */
  extraSpin: boolean;
  /** Player ids in the order they retired. */
  finishOrder: number[];
};
