export type Career = {
  id: string;
  emoji: string;
  name: string;
  /** Paid on every "Wypłata" tile the player lands on or drives past. */
  salary: number;
  /** Only players who passed "Obrona dyplomu" can pick it. */
  requiresDegree: boolean;
};

export const CAREERS: Career[] = [
  { id: "barista", emoji: "☕", name: "Barista", salary: 20000, requiresDegree: false },
  { id: "courier", emoji: "📦", name: "Kurier", salary: 25000, requiresDegree: false },
  { id: "hairdresser", emoji: "💇", name: "Fryzjer", salary: 28000, requiresDegree: false },
  { id: "mechanic", emoji: "🔧", name: "Mechanik", salary: 32000, requiresDegree: false },
  { id: "police", emoji: "👮", name: "Policjant", salary: 36000, requiresDegree: false },
  { id: "musician", emoji: "🎻", name: "Muzyk", salary: 40000, requiresDegree: false },
  { id: "teacher", emoji: "👩‍🏫", name: "Nauczyciel", salary: 45000, requiresDegree: true },
  { id: "programmer", emoji: "👨‍💻", name: "Programista", salary: 70000, requiresDegree: true },
  { id: "architect", emoji: "📐", name: "Architekt", salary: 65000, requiresDegree: true },
  { id: "vet", emoji: "🐾", name: "Weterynarz", salary: 60000, requiresDegree: true },
  { id: "doctor", emoji: "🩺", name: "Lekarz", salary: 90000, requiresDegree: true },
  { id: "lawyer", emoji: "⚖️", name: "Prawnik", salary: 80000, requiresDegree: true },
];

export const CAREERS_BY_ID = Object.fromEntries(
  CAREERS.map((career) => [career.id, career]),
) as Record<string, Career>;

/** How many careers a player is offered on a career tile. */
export const CAREER_CHOICES = 3;
