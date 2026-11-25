import { BOARD } from "../blueprint";
import { ACTION_CARDS } from "../content/action-cards";
import { CAREER_CHOICES, CAREERS } from "../content/careers";
import { needsTarget, type Effect } from "../content/effects";
import { HOUSE_CHOICES, HOUSES } from "../content/houses";
import { LIFE_EVENTS, MIDLIFE_EVENTS, type LifeEvent } from "../content/life-events";
import {
  BABY_GIFT,
  PET_COST,
  PLACE_BONUS,
  TUITION,
  TWINS_CHANCE,
  WEDDING_GIFT,
} from "../content/rules";
import { formatMoneyChange } from "../utils/format-money";
import { applyEffects } from "./apply-effects";
import { pickRandom, pickSome, shuffle, type Random } from "./random";
import type { EngineState, NoticeTone, Prompt } from "./types";

type Result = { state: EngineState; prompts: Prompt[] };

/** Every card id repeated by its copy count, shuffled. */
export function buildDeck(random: Random) {
  return shuffle(
    ACTION_CARDS.flatMap((card) => Array.from({ length: card.copies }, () => card.id)),
    random,
  );
}

/** Applies effects now and returns them as a notice the player reads. */
function noticeWith(
  state: EngineState,
  tone: NoticeTone,
  content: { emoji: string; title: string; body: string },
  effects: Effect[],
): Result {
  const applied = applyEffects(state, effects);

  return {
    state: applied.state,
    prompts: [{ kind: "notice", tone, ...content, lines: applied.lines }],
  };
}

/** Other players still on the board: valid picks for target cards. */
function targetIndexes(state: EngineState) {
  return state.players
    .map((player, index) => ({ player, index }))
    .filter(({ player, index }) => index !== state.currentIndex && !player.finished)
    .map(({ index }) => index);
}

/** Cards and events share this: target effects wait for a pick, the rest apply now. */
function playEffects(
  state: EngineState,
  tone: NoticeTone,
  content: { emoji: string; title: string; body: string },
  effects: Effect[],
): Result {
  if (!needsTarget(effects)) {
    return noticeWith(state, tone, content, effects);
  }

  const targets = targetIndexes(state);

  if (targets.length === 0) {
    return {
      state,
      prompts: [{ kind: "notice", tone, ...content, lines: ["Nie ma innego gracza do wyboru"] }],
    };
  }

  return { state, prompts: [{ kind: "choose-target", ...content, effects, targets }] };
}

function drawCard(state: EngineState, random: Random): Result {
  const deck = state.deck.length > 0 ? [...state.deck] : buildDeck(random);
  const cardId = deck.pop() as string;
  const card = ACTION_CARDS.find((candidate) => candidate.id === cardId) ?? ACTION_CARDS[0];

  return playEffects(
    { ...state, deck },
    "card",
    { emoji: card.emoji, title: card.title, body: card.description },
    card.effects,
  );
}

function drawEvent(state: EngineState, pool: LifeEvent[], random: Random): Result {
  const event = pickRandom(pool, random);

  return playEffects(
    state,
    "event",
    { emoji: event.emoji, title: event.title, body: event.description },
    event.effects,
  );
}

/**
 * What happens when the current player's pawn stops. Returns the new state plus the prompts the
 * modal shows, in order. Rules by priority: retirement, the tile's one-off action, its kind.
 */
export function resolveLanding(state: EngineState, random: Random = Math.random): Result {
  const player = state.players[state.currentIndex];
  const tile = BOARD.tilesById[player.tileId];

  if (tile.kind === "retire") {
    const place = state.finishOrder.indexOf(player.id) + 1;
    const bonus = PLACE_BONUS[place - 1] ?? 0;

    return noticeWith(
      state,
      "finish",
      { emoji: "🏖️", title: "Emerytura!", body: `Docierasz do mety jako ${place}. gracz.` },
      [{ type: "money", amount: bonus }],
    );
  }

  switch (tile.action) {
    case "enroll":
      return noticeWith(
        state,
        "tile",
        { emoji: "🎓", title: "Immatrykulacja", body: "Witamy na studiach! Czas zapłacić czesne." },
        [{ type: "money", amount: -TUITION }],
      );
    case "graduate": {
      const players = state.players.map((candidate, index) =>
        index === state.currentIndex ? { ...candidate, hasDegree: true } : candidate,
      );

      return {
        state: { ...state, players },
        prompts: [
          {
            kind: "notice",
            tone: "tile",
            emoji: "📜",
            title: "Obrona dyplomu",
            body: "Masz dyplom! Na polu Wybór zawodu czekają na ciebie lepsze posady.",
            lines: ["Dyplom zdobyty"],
          },
        ],
      };
    }
    case "wedding":
      return noticeWith(
        state,
        "tile",
        { emoji: "💍", title: "Ślub", body: "Goście przynoszą koperty." },
        [{ type: "collectFromOthers", amount: WEDDING_GIFT }],
      );
    case "midlife":
      return drawEvent(state, MIDLIFE_EVENTS, random);
    case "bonus":
      return noticeWith(
        state,
        "payday",
        { emoji: "💰", title: "Premia", body: "Podwójna wypłata za całe lata pracy." },
        [{ type: "salary", multiplier: 2 }],
      );
    case null:
      break;
  }

  switch (tile.kind) {
    case "action":
      return drawCard(state, random);
    case "event":
      return drawEvent(
        state,
        LIFE_EVENTS.filter((event) => !event.regions || event.regions.includes(tile.region)),
        random,
      );
    case "payday":
      return noticeWith(
        state,
        "payday",
        { emoji: "💵", title: "Wypłata", body: "Dzień wypłaty!" },
        [{ type: "salary", multiplier: 1 }],
      );
    case "career": {
      const eligible = CAREERS.filter((career) => player.hasDegree || !career.requiresDegree);
      const options = pickSome(
        eligible.filter((career) => career.id !== player.careerId),
        CAREER_CHOICES,
        random,
      ).map((career) => career.id);

      return { state, prompts: [{ kind: "career", options, canKeep: player.careerId !== null }] };
    }
    case "house":
      return {
        state,
        prompts: [
          {
            kind: "house",
            options: pickSome(HOUSES, HOUSE_CHOICES, random).map((house) => house.id),
          },
        ],
      };
    case "baby": {
      const count = random() < TWINS_CHANCE ? 2 : 1;

      return noticeWith(
        state,
        "tile",
        {
          emoji: count === 2 ? "👶👶" : "👶",
          title: count === 2 ? "Bliźnięta!" : "Dziecko",
          body: "Rodzina się powiększa. Każdy gracz daje prezent.",
        },
        [
          { type: "addChildren", count },
          { type: "collectFromOthers", amount: BABY_GIFT },
        ],
      );
    }
    case "pet":
      return noticeWith(
        state,
        "tile",
        {
          emoji: "🐾",
          title: tile.label ?? "Zwierzak",
          body: "Nowy przyjaciel w domu. Miska i smycz kosztują.",
        },
        [{ type: "addPet" }, { type: "money", amount: -PET_COST }],
      );
    case "stop":
      return {
        state,
        prompts: [
          {
            kind: "notice",
            tone: "tile",
            emoji: "🛑",
            title: tile.label ?? "Postój",
            body: "Obowiązkowy postój. Tu kończysz ruch.",
            lines: [],
          },
        ],
      };
    case "start":
      return { state, prompts: [] };
  }
}

/** Salary collected when a pawn drives over a payday tile without stopping on it. */
export function passPayday(state: EngineState) {
  const player = state.players[state.currentIndex];

  if (player.salary === 0) {
    return { state, line: null };
  }

  const applied = applyEffects(state, [{ type: "salary", multiplier: 1 }]);

  return { state: applied.state, line: `Wypłata po drodze: ${formatMoneyChange(player.salary)}` };
}
