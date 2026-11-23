/** Vehicles a player can drive. The 3D model for each id lives in the game screen's scene. */
export type VehicleId = "car" | "camper" | "motorbike" | "bus";

export type Vehicle = {
  id: VehicleId;
  name: string;
  emoji: string;
};

export const VEHICLES: Vehicle[] = [
  { id: "car", name: "Auto", emoji: "🚗" },
  { id: "camper", name: "Kamper", emoji: "🚐" },
  { id: "motorbike", name: "Motocykl", emoji: "🏍️" },
  { id: "bus", name: "Autobus", emoji: "🚌" },
];

export const VEHICLES_BY_ID = Object.fromEntries(
  VEHICLES.map((vehicle) => [vehicle.id, vehicle]),
) as Record<VehicleId, Vehicle>;

/** One color per seat; the number of colors caps the number of players. */
export const PLAYER_COLORS = ["#E63946", "#3D8BFF", "#2EC4B6", "#FFB703"] as const;

export const MIN_PLAYERS = 1;
export const MAX_PLAYERS = PLAYER_COLORS.length;
