import type { ImageSourcePropType } from "react-native";

export type PokemonLocation = {
  id: string;
  name: string;
  region: string;
  subtitle: string;
  description: string;
  highlights: string[];
  image: ImageSourcePropType;
};

export function getPokemonLocation(id: string): PokemonLocation | undefined {
  return POKEMON_LOCATIONS.find((location) => location.id === id);
}

export const POKEMON_LOCATIONS: PokemonLocation[] = [
  {
    id: "pallet-town",
    name: "Pallet Town",
    region: "Kanto",
    subtitle: "Shades of your journey await!",
    description:
      "A quiet riverside town tucked between Route 1 and Route 21. Home to Professor Oak's research laboratory, where every Kanto trainer chooses their first partner Pokémon.",
    highlights: ["Professor Oak's Lab", "Route 1 Trailhead", "Starter Town"],
    image: require("./assets/pallet-town.jpg"),
  },
  {
    id: "ecruteak-city",
    name: "Ecruteak City",
    region: "Johto",
    subtitle: "A historical city where the past meets the present.",
    description:
      "Framed by autumn maples and stone lanterns, Ecruteak preserves Johto's oldest legends around the towering Bell Tower and the ruins of the Burned Tower.",
    highlights: ["Bell Tower", "Burned Tower", "Dance Theater"],
    image: require("./assets/ecruteak-city.jpg"),
  },
  {
    id: "mount-silver",
    name: "Mt. Silver",
    region: "Johto",
    subtitle: "A towering peak reserved for champions.",
    description:
      "Rising high above the clouds on the border of Kanto and Johto, its freezing summit and ancient stone ruins host the ultimate test for seasoned trainers.",
    highlights: ["Summit Ruins", "Alpine Caverns", "Champion's Peak"],
    image: require("./assets/mount-silver.jpg"),
  },
];
