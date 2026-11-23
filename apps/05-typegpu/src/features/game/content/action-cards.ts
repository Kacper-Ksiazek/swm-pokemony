import type { Effect } from "./effects";

export type ActionCard = {
  id: string;
  emoji: string;
  title: string;
  description: string;
  effects: Effect[];
  /** How many copies go into the shuffled deck. */
  copies: number;
};

/** The deck drawn on every "Karta akcji" tile. Reshuffled when it runs out. */
export const ACTION_CARDS: ActionCard[] = [
  {
    id: "lottery",
    emoji: "🎟️",
    title: "Wygrana na loterii",
    description: "Zdrapka okazała się szczęśliwa.",
    effects: [{ type: "money", amount: 30000 }],
    copies: 2,
  },
  {
    id: "inheritance",
    emoji: "📜",
    title: "Spadek po cioci",
    description: "Ciocia z Ameryki zostawiła ci okrągłą sumkę.",
    effects: [{ type: "money", amount: 50000 }],
    copies: 1,
  },
  {
    id: "car-repair",
    emoji: "🔧",
    title: "Naprawa auta",
    description: "Skrzynia biegów odmówiła posłuszeństwa.",
    effects: [{ type: "money", amount: -15000 }],
    copies: 2,
  },
  {
    id: "tax-return",
    emoji: "🧾",
    title: "Zwrot podatku",
    description: "Urząd skarbowy oddaje nadpłatę.",
    effects: [{ type: "money", amount: 12000 }],
    copies: 2,
  },
  {
    id: "promotion",
    emoji: "📈",
    title: "Awans!",
    description: "Szef docenił twoją pracę. Pensja rośnie na stałe.",
    effects: [{ type: "salaryRaise", amount: 10000 }],
    copies: 2,
  },
  {
    id: "overtime",
    emoji: "⏰",
    title: "Nadgodziny",
    description: "Weekend w pracy, ale przelew się zgadza.",
    effects: [{ type: "salary", multiplier: 1 }],
    copies: 2,
  },
  {
    id: "shortcut",
    emoji: "🛣️",
    title: "Skrót przez miasto",
    description: "Znasz drogę na skróty. Jedź 3 pola dalej.",
    effects: [{ type: "moveForward", steps: 3 }],
    copies: 2,
  },
  {
    id: "second-wind",
    emoji: "🎡",
    title: "Drugi oddech",
    description: "Kręć kołem jeszcze raz po tej turze.",
    effects: [{ type: "extraSpin" }],
    copies: 2,
  },
  {
    id: "flu",
    emoji: "🤒",
    title: "Grypa",
    description: "Tydzień pod kocem. Tracisz następną kolejkę.",
    effects: [{ type: "skipNextTurn" }],
    copies: 1,
  },
  {
    id: "birthday",
    emoji: "🎂",
    title: "Twoje urodziny",
    description: "Każdy gracz daje ci prezent.",
    effects: [{ type: "collectFromOthers", amount: 5000 }],
    copies: 2,
  },
  {
    id: "party",
    emoji: "🍕",
    title: "Stawiasz pizzę",
    description: "Płacisz każdemu graczowi za jego kawałek.",
    effects: [{ type: "payOthers", amount: 3000 }],
    copies: 1,
  },
  {
    id: "lawsuit",
    emoji: "⚖️",
    title: "Wygrany proces",
    description: "Wybierz gracza, który musi ci zapłacić odszkodowanie.",
    effects: [{ type: "takeFromTarget", amount: 20000 }],
    copies: 2,
  },
  {
    id: "loan-friend",
    emoji: "🤝",
    title: "Pożyczka dla przyjaciela",
    description: "Wybierz gracza, któremu pożyczasz pieniądze. Raczej ich nie zobaczysz.",
    effects: [{ type: "giveToTarget", amount: 10000 }],
    copies: 1,
  },
  {
    id: "swap",
    emoji: "🔄",
    title: "Zamiana miejsc",
    description: "Wybierz gracza i zamieńcie się pionkami na planszy.",
    effects: [{ type: "swapWithTarget" }],
    copies: 2,
  },
  {
    id: "traffic-jam",
    emoji: "🚧",
    title: "Korek na obwodnicy",
    description: "Wybierz gracza, który utknie w korku i straci kolejkę.",
    effects: [{ type: "targetSkipsTurn" }],
    copies: 2,
  },
  {
    id: "adopt",
    emoji: "🐶",
    title: "Znaleziony szczeniak",
    description: "Przybłąkał się pies i już z tobą zostaje.",
    effects: [{ type: "addPet" }],
    copies: 1,
  },
];
