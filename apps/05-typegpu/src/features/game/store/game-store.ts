import { create } from "zustand";

import { BOARD, type TileId } from "../blueprint";
import { CAREERS_BY_ID } from "../content/careers";
import { HOUSES_BY_ID } from "../content/houses";
import { STARTING_MONEY } from "../content/rules";
import { applyEffects } from "../engine/apply-effects";
import { buildDeck, passPayday, resolveLanding } from "../engine/resolve-landing";
import type { EngineState, Player, Prompt } from "../engine/types";
import { formatMoney } from "../utils/format-money";
import { MAX_PLAYERS, MIN_PLAYERS, PLAYER_COLORS } from "../vehicles";
import { resolveStep, rollSpin } from "./game-rules";

export type { Player, Prompt } from "../engine/types";

/**
 * A turn goes idle → spinning (wheel modal) → moving (pawn drives tile by tile; a fork pauses it
 * in choosing-branch) → landed (the modal works through `prompts`) → next player's idle.
 * Cards can send the pawn moving again or grant another spin before the turn ends.
 */
export type TurnStatus = "idle" | "spinning" | "moving" | "choosing-branch" | "landed";

export type GamePhase = "setup" | "playing" | "finished";

type GameState = EngineState & {
  phase: GamePhase;
  status: TurnStatus;
  spin: number | null;
  stepsLeft: number;
  branchOptions: TileId[];
  /** What the modal asks or tells next, first item on screen. */
  prompts: Prompt[];
  /** Salary collected while driving this move, shown before the landing prompts. */
  driveLog: string[];
  /** One-line news for the panel, e.g. who lost a turn. */
  banner: string | null;

  setPlayerCount: (count: number) => void;
  updatePlayer: (index: number, patch: Partial<Pick<Player, "name" | "vehicleId">>) => void;
  startGame: () => void;
  spinWheel: () => void;
  startMoving: () => void;
  step: () => void;
  chooseBranch: (tileId: TileId) => void;
  acknowledgePrompt: () => void;
  chooseTarget: (playerIndex: number) => void;
  chooseCareer: (careerId: string | null) => void;
  buyHouse: (houseId: string | null) => void;
  resetGame: () => void;
};

function freshPlayer(index: number, base?: Player): Player {
  return {
    id: index,
    name: base?.name ?? `Gracz ${index + 1}`,
    vehicleId: base?.vehicleId ?? "car",
    color: PLAYER_COLORS[index],
    tileId: BOARD.startTileId,
    finished: false,
    lastSpin: null,
    money: STARTING_MONEY,
    careerId: null,
    salary: 0,
    hasDegree: false,
    houseId: null,
    children: 0,
    pets: 0,
    skipNextTurn: false,
  };
}

const idleTurn = {
  status: "idle" as TurnStatus,
  spin: null,
  stepsLeft: 0,
  branchOptions: [] as TileId[],
  prompts: [] as Prompt[],
  driveLog: [] as string[],
  pendingSteps: 0,
  extraSpin: false,
};

export const useGameStore = create<GameState>()((set, get) => {
  /** The engine's view of the store. */
  const engineState = (): EngineState => {
    const { players, currentIndex, deck, pendingSteps, extraSpin, finishOrder } = get();

    return { players, currentIndex, deck, pendingSteps, extraSpin, finishOrder };
  };

  const updateCurrent = (patch: Partial<Player>) => {
    const { players, currentIndex } = get();

    return players.map((player, index) =>
      index === currentIndex ? { ...player, ...patch } : player,
    );
  };

  /** Next player who is still playing; players marked to skip lose this one turn. */
  const passTurn = () => {
    const { players, currentIndex } = get();

    if (players.every((player) => player.finished)) {
      set({ phase: "finished", ...idleTurn, banner: null });

      return;
    }

    const updated = players.map((player) => ({ ...player }));
    const skipped: string[] = [];
    let next = currentIndex;

    // Bounded: each pass clears one skip flag, so a full lap always finds a player.
    for (let guard = 0; guard < updated.length * 2; guard += 1) {
      next = (next + 1) % updated.length;

      if (updated[next].finished) {
        continue;
      }

      if (updated[next].skipNextTurn) {
        updated[next].skipNextTurn = false;
        skipped.push(updated[next].name);
        continue;
      }

      break;
    }

    set({
      players: updated,
      currentIndex: next,
      ...idleTurn,
      banner: skipped.length > 0 ? `Kolejkę traci: ${skipped.join(", ")}` : null,
    });
  };

  /** Called whenever the prompt queue empties: keep driving, spin again, or pass the turn. */
  const finishPrompts = () => {
    const { pendingSteps, extraSpin, players, currentIndex } = get();
    const player = players[currentIndex];

    if (pendingSteps > 0 && !player.finished) {
      set({
        status: "moving",
        stepsLeft: pendingSteps,
        pendingSteps: 0,
        prompts: [],
        driveLog: [],
      });

      return;
    }

    if (extraSpin && !player.finished) {
      set({ ...idleTurn, banner: `${player.name} kręci jeszcze raz!` });

      return;
    }

    passTurn();
  };

  /** Drops the answered prompt, adds follow-ups, and moves on when nothing is left. */
  const nextPrompt = (followUps: Prompt[] = []) => {
    const prompts = [...followUps, ...get().prompts.slice(1)];

    set({ prompts });

    if (prompts.length === 0) {
      finishPrompts();
    }
  };

  /** The pawn stopped: run the tile rules and open the modal on the result. */
  const land = () => {
    const resolved = resolveLanding(engineState());
    const { driveLog } = get();
    const prompts: Prompt[] = [
      ...(driveLog.length > 0
        ? [
            {
              kind: "notice" as const,
              tone: "payday" as const,
              emoji: "💵",
              title: "Po drodze",
              body: "Przejeżdżasz przez pole wypłaty.",
              lines: driveLog,
            },
          ]
        : []),
      ...resolved.prompts,
    ];

    set({ ...resolved.state, status: "landed", stepsLeft: 0, driveLog: [], prompts });

    if (prompts.length === 0) {
      finishPrompts();
    }
  };

  /** Moves the current player one tile and works out what happens next. */
  const applyStep = (chosenTileId?: TileId) => {
    const { players, currentIndex, stepsLeft, finishOrder, driveLog } = get();
    const player = players[currentIndex];
    const outcome = resolveStep(BOARD, player.tileId, stepsLeft, chosenTileId);

    if (outcome.type === "fork") {
      set({ status: "choosing-branch", branchOptions: outcome.options });

      return;
    }

    const tile = BOARD.tilesById[outcome.tileId];
    const reachedFinish = tile.next.length === 0;

    set({
      players: updateCurrent({ tileId: outcome.tileId, finished: reachedFinish }),
      finishOrder: reachedFinish ? [...finishOrder, player.id] : finishOrder,
      branchOptions: [],
    });

    if (outcome.type === "landed") {
      land();

      return;
    }

    // Driving over a payday still pays (landing on one is handled by the landing rules).
    if (tile.kind === "payday") {
      const paid = passPayday(engineState());

      set({
        players: paid.state.players,
        driveLog: paid.line ? [...driveLog, paid.line] : driveLog,
      });
    }

    set({ status: "moving", stepsLeft: stepsLeft - 1 });
  };

  return {
    phase: "setup",
    players: [freshPlayer(0), freshPlayer(1)],
    currentIndex: 0,
    deck: [],
    finishOrder: [],
    banner: null,
    ...idleTurn,

    setPlayerCount: (count) => {
      const clamped = Math.min(MAX_PLAYERS, Math.max(MIN_PLAYERS, count));
      const current = get().players;

      set({
        players: Array.from(
          { length: clamped },
          (_, index) => current[index] ?? freshPlayer(index),
        ),
      });
    },

    updatePlayer: (index, patch) =>
      set({
        players: get().players.map((player, at) =>
          at === index ? { ...player, ...patch } : player,
        ),
      }),

    startGame: () =>
      set({
        phase: "playing",
        currentIndex: 0,
        ...idleTurn,
        deck: buildDeck(Math.random),
        finishOrder: [],
        banner: null,
        players: get().players.map((player, index) => {
          const fresh = freshPlayer(index, player);

          return { ...fresh, name: fresh.name.trim() || `Gracz ${index + 1}` };
        }),
      }),

    spinWheel: () => {
      if (get().status !== "idle") {
        return;
      }

      const spin = rollSpin();

      set({ status: "spinning", spin, banner: null, players: updateCurrent({ lastSpin: spin }) });
    },

    startMoving: () => set({ status: "moving", stepsLeft: get().spin ?? 0 }),

    step: () => {
      if (get().status === "moving") {
        applyStep();
      }
    },

    chooseBranch: (tileId) => {
      if (get().status === "choosing-branch") {
        applyStep(tileId);
      }
    },

    acknowledgePrompt: () => {
      if (get().prompts[0]?.kind === "notice") {
        nextPrompt();
      }
    },

    chooseTarget: (playerIndex) => {
      const prompt = get().prompts[0];

      if (prompt?.kind !== "choose-target") {
        return;
      }

      const applied = applyEffects(engineState(), prompt.effects, playerIndex);

      set(applied.state);
      nextPrompt([
        {
          kind: "notice",
          tone: "card",
          emoji: prompt.emoji,
          title: prompt.title,
          body: prompt.body,
          lines: applied.lines,
        },
      ]);
    },

    chooseCareer: (careerId) => {
      if (get().prompts[0]?.kind !== "career") {
        return;
      }

      if (careerId) {
        const career = CAREERS_BY_ID[careerId];

        set({ players: updateCurrent({ careerId, salary: career.salary }) });
        nextPrompt([
          {
            kind: "notice",
            tone: "tile",
            emoji: career.emoji,
            title: career.name,
            body: "Nowa praca, nowe możliwości.",
            lines: [`Pensja: ${formatMoney(career.salary)}`],
          },
        ]);

        return;
      }

      nextPrompt();
    },

    buyHouse: (houseId) => {
      if (get().prompts[0]?.kind !== "house") {
        return;
      }

      if (houseId) {
        const house = HOUSES_BY_ID[houseId];
        const player = get().players[get().currentIndex];
        // Moving house: the old one is sold at its value first.
        const sold = player.houseId ? HOUSES_BY_ID[player.houseId] : null;
        const money = player.money + (sold?.value ?? 0) - house.price;

        set({ players: updateCurrent({ houseId, money }) });
        nextPrompt([
          {
            kind: "notice",
            tone: "tile",
            emoji: house.emoji,
            title: house.name,
            body:
              money < 0
                ? "Kupione na kredyt. Konto jest na minusie, ale dom zostaje twój."
                : "Klucze są twoje!",
            lines: [
              ...(sold ? [`Sprzedajesz: ${sold.name} za ${formatMoney(sold.value)}`] : []),
              `Cena: ${formatMoney(house.price)}`,
              `Wartość na koniec gry: ${formatMoney(house.value)}`,
            ],
          },
        ]);

        return;
      }

      nextPrompt();
    },

    resetGame: () =>
      set({
        phase: "setup",
        currentIndex: 0,
        ...idleTurn,
        finishOrder: [],
        banner: null,
        players: get().players.map((player, index) => freshPlayer(index, player)),
      }),
  };
});
