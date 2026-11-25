import type { BoardRegion } from "../blueprint";
import type { Effect } from "./effects";

export type LifeEvent = {
  id: string;
  emoji: string;
  title: string;
  description: string;
  effects: Effect[];
  /** Regions where this event can happen. Omitted = anywhere. */
  regions?: BoardRegion[];
};

/** Events drawn on "Wydarzenie" tiles, filtered by the region of the tile's route. */
export const LIFE_EVENTS: LifeEvent[] = [
  // Anywhere
  {
    id: "found-wallet",
    emoji: "👛",
    title: "Znaleziony portfel",
    description: "Oddajesz go właścicielowi, a on daje ci znaleźne.",
    effects: [{ type: "money", amount: 5000 }],
  },
  {
    id: "broken-phone",
    emoji: "📱",
    title: "Zbity telefon",
    description: "Ekran w drobny mak. Nowy kosztuje.",
    effects: [{ type: "money", amount: -4000 }],
  },
  {
    id: "concert",
    emoji: "🎸",
    title: "Koncert marzeń",
    description: "Bilety drogie, ale wspomnienia bezcenne.",
    effects: [{ type: "money", amount: -3000 }],
  },
  {
    id: "good-mood",
    emoji: "🌈",
    title: "Dobry dzień",
    description: "Wszystko idzie gładko. Jedziesz 2 pola dalej.",
    effects: [{ type: "moveForward", steps: 2 }],
  },
  // Campus
  {
    id: "scholarship",
    emoji: "🏅",
    title: "Stypendium naukowe",
    description: "Średnia 5,0 się opłaciła.",
    effects: [{ type: "money", amount: 15000 }],
    regions: ["campus"],
  },
  {
    id: "textbooks",
    emoji: "📚",
    title: "Podręczniki",
    description: "Każdy profesor ma swoją książkę. Każda kosztuje.",
    effects: [{ type: "money", amount: -5000 }],
    regions: ["campus"],
  },
  {
    id: "all-nighter",
    emoji: "☕",
    title: "Nocka przed sesją",
    description: "Zaśpisz na egzamin. Tracisz następną kolejkę.",
    effects: [{ type: "skipNextTurn" }],
    regions: ["campus"],
  },
  // Downtown
  {
    id: "side-gig",
    emoji: "💻",
    title: "Zlecenie po godzinach",
    description: "Szybki projekt dla znajomego.",
    effects: [{ type: "money", amount: 10000 }],
    regions: ["downtown", "suburbs"],
  },
  {
    id: "parking-ticket",
    emoji: "🅿️",
    title: "Mandat za parkowanie",
    description: "Pięć minut to jednak za długo.",
    effects: [{ type: "money", amount: -2000 }],
    regions: ["downtown", "suburbs"],
  },
  {
    id: "bonus",
    emoji: "💼",
    title: "Premia kwartalna",
    description: "Firma miała dobry kwartał.",
    effects: [{ type: "salary", multiplier: 1 }],
    regions: ["downtown", "suburbs"],
  },
  // Suburbs and family
  {
    id: "school-trip",
    emoji: "🚌",
    title: "Wycieczka szkolna",
    description: "Płacisz za każde dziecko.",
    effects: [{ type: "moneyPerChild", amount: -3000 }],
    regions: ["suburbs", "meadow"],
  },
  {
    id: "vet",
    emoji: "🩺",
    title: "Wizyta u weterynarza",
    description: "Płacisz za każdego zwierzaka.",
    effects: [{ type: "moneyPerPet", amount: -2500 }],
    regions: ["suburbs", "meadow", "alpine"],
  },
  {
    id: "garden-sale",
    emoji: "🪴",
    title: "Wyprzedaż garażowa",
    description: "Sąsiedzi kupili wszystkie stare rzeczy.",
    effects: [{ type: "money", amount: 6000 }],
    regions: ["suburbs", "meadow"],
  },
  {
    id: "family-dinner",
    emoji: "🍲",
    title: "Rodzinny obiad",
    description: "Wszyscy przychodzą do ciebie. Każdy gracz przynosi coś od siebie.",
    effects: [{ type: "collectFromOthers", amount: 2000 }],
    regions: ["meadow"],
  },
  // Adventure
  {
    id: "mountain-guide",
    emoji: "🧗",
    title: "Przewodnik górski",
    description: "Prowadzisz turystów na szczyt.",
    effects: [{ type: "money", amount: 12000 }],
    regions: ["alpine"],
  },
  {
    id: "storm",
    emoji: "⛈️",
    title: "Burza w górach",
    description: "Czekasz w schronisku. Tracisz następną kolejkę.",
    effects: [{ type: "skipNextTurn" }],
    regions: ["alpine"],
  },
  {
    id: "photo-contest",
    emoji: "📸",
    title: "Konkurs fotograficzny",
    description: "Twoje zdjęcie szczytu wygrywa.",
    effects: [{ type: "money", amount: 8000 }, { type: "extraSpin" }],
    regions: ["alpine"],
  },
  // Golden years
  {
    id: "grandkids",
    emoji: "👵",
    title: "Odwiedziny wnuków",
    description: "Każde dziecko przywozi ci prezent.",
    effects: [{ type: "moneyPerChild", amount: 5000 }],
    regions: ["harbor"],
  },
  {
    id: "cruise",
    emoji: "🛳️",
    title: "Rejs dookoła świata",
    description: "Raz się żyje!",
    effects: [{ type: "money", amount: -20000 }],
    regions: ["harbor"],
  },
  {
    id: "pension-fund",
    emoji: "🏦",
    title: "Fundusz emerytalny",
    description: "Oszczędności z lat pracy procentują.",
    effects: [{ type: "salary", multiplier: 2 }],
    regions: ["harbor"],
  },
];

/** Drawn on "Kryzys wieku średniego": bigger swings, for better or worse. */
export const MIDLIFE_EVENTS: LifeEvent[] = [
  {
    id: "sports-car",
    emoji: "🏎️",
    title: "Kabriolet z salonu",
    description: "Zawsze o nim marzyłeś.",
    effects: [{ type: "money", amount: -40000 }],
  },
  {
    id: "startup",
    emoji: "🚀",
    title: "Własny startup",
    description: "Ryzyko się opłaciło. Pensja rośnie na stałe.",
    effects: [{ type: "salaryRaise", amount: 20000 }],
  },
  {
    id: "sabbatical",
    emoji: "🏝️",
    title: "Roczny urlop",
    description: "Wyjeżdżasz odpocząć. Tracisz następną kolejkę, ale nabierasz sił.",
    effects: [{ type: "skipNextTurn" }, { type: "extraSpin" }],
  },
  {
    id: "marathon",
    emoji: "🏃",
    title: "Pierwszy maraton",
    description: "Biegniesz jak szalony. Jedziesz 4 pola dalej.",
    effects: [{ type: "moveForward", steps: 4 }],
  },
];
