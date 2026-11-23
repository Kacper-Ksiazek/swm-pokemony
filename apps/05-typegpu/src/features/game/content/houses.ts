export type House = {
  id: string;
  emoji: string;
  name: string;
  price: number;
  /** What the house adds to the final score at retirement. */
  value: number;
};

export const HOUSES: House[] = [
  { id: "studio", emoji: "🏢", name: "Kawalerka w bloku", price: 80000, value: 100000 },
  { id: "townhouse", emoji: "🏘️", name: "Szeregowiec", price: 150000, value: 190000 },
  { id: "cottage", emoji: "🏡", name: "Domek z ogródkiem", price: 200000, value: 260000 },
  { id: "loft", emoji: "🏙️", name: "Loft w centrum", price: 250000, value: 300000 },
  { id: "villa", emoji: "🏰", name: "Willa nad jeziorem", price: 400000, value: 520000 },
];

export const HOUSES_BY_ID = Object.fromEntries(HOUSES.map((house) => [house.id, house])) as Record<
  string,
  House
>;

/** How many houses a player is offered on a house tile. */
export const HOUSE_CHOICES = 2;
