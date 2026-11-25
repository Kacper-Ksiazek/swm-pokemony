import { environment, lighting } from "@typegpu/kit";

import { createBeachView } from "@/beach";
import { createBuildings } from "@/buildings";
import { createDebris } from "@/debris";
import { createFireworks } from "@/fireworks";
import { createHelicopter } from "@/helicopter";
import { createSigns } from "@/signs";
import { createSpray } from "@/spray";

import { smooth } from "./tide";

const clamp01 = (t: number) => Math.min(Math.max(t, 0), 1);
const mix = (a: number, b: number, t: number) => a + (b - a) * t;
const mix3 = (a: readonly number[], b: readonly number[], t: number) =>
  [mix(a[0], b[0], t), mix(a[1], b[1], t), mix(a[2], b[2], t)] as [number, number, number];

/** Where the town lies on the globe, in radians: about 52 degrees north, in early summer. */
const LATITUDE = 0.9;
const DECLINATION = 0.3;
/** The hour the town opens at: golden light from a low sun, the first windows lit. */
export const DUSK = 19;
/** The sky's own glow and the light bounced off the ground, by day and by night. */
const DAY_SKY = [0.32, 0.42, 0.58] as const;
const DAY_GROUND = [0.2, 0.18, 0.15] as const;
const NIGHT_SKY = [0.018, 0.028, 0.06] as const;
const NIGHT_GROUND = [0.012, 0.011, 0.01] as const;
/** Sunlight at noon, in the lighting's units. */
const SUN = 2.4;
/** Seconds between bakes of the sky while the hour slider moves. */
export const REBAKE = 0.08;

type Light = ReturnType<typeof lighting.create>;
type Buildings = ReturnType<typeof createBuildings>;
type Shore = ReturnType<typeof createBeachView>;
type Signs = ReturnType<typeof createSigns>;
type Helicopter = ReturnType<typeof createHelicopter>;
type Fireworks = ReturnType<typeof createFireworks>;
type Debris = ReturnType<typeof createDebris>;
type Spray = ReturnType<typeof createSpray>;

export type DaylightState = {
  storm: number;
  skyChanged: boolean;
  sinceBake: number;
};

export function createDaylight(parts: {
  light: Light;
  buildings: Buildings;
  shore: Shore;
  signs: Signs;
  helicopters: readonly Helicopter[];
  fireworks: Fireworks;
  debris: Debris;
  spray: Spray;
}) {
  const { light, buildings, shore, signs, helicopters, fireworks, debris, spray } = parts;

  /**
   * Puts the sun where it stands at an hour of the day and dims the sky after it. Toward night
   * more windows light up and glow brighter, and the sky is baked again for the new light.
   */
  let skyChanged = true;
  let sinceBake = REBAKE;
  let hour = DUSK;
  let storm = 0;
  /**
   * Lights the town for the hour, the storm and the lightning. A storm hides the sun and greys
   * the sky, so windows and lamps come on earlier; a stroke of lightning brightens the sky for a
   * moment. The sky is baked again only when the hour or the storm changes.
   */
  const applyLight = (flash: number) => {
    const sun = environment.sunAt(hour, LATITUDE, DECLINATION);
    const day = smooth(clamp01((sun.y + 0.04) / 0.3));
    // Windows light up from when the sun is low until it has set, and early under storm clouds
    const dusk = Math.max(1 - smooth(clamp01((sun.y + 0.02) / 0.2)), storm * 0.7);
    // The air dims a low sun far more than the sky; expose for it, as an eye adjusts at dusk
    const color = environment.sunColor(sun);
    const brightness = 0.2126 * color.x + 0.7152 * color.y + 0.0722 * color.z;
    const clouds = 1 - storm * 0.55;
    const grey = (c: [number, number, number]) =>
      mix3(
        c,
        [0.12, 0.13, 0.15].map((v) => v * Math.max(day, 0.1)),
        storm * 0.6,
      );
    light.settings.patch({
      sunDirection: sun,
      sunColor: color,
      sunIntensity: (SUN / Math.max(brightness, 0.33)) * (1 - storm * 0.8),
      skyTop: grey(mix3(NIGHT_SKY, DAY_SKY, day)).map((v) => v * clouds) as [
        number,
        number,
        number,
      ],
      skyBottom: mix3(NIGHT_GROUND, DAY_GROUND, day),
      skyIntensity: 1.2 + flash * 5,
    });
    buildings.evening.write({ lit: mix(0.03, 0.6, dusk), glow: mix(0.4, 3.5, dusk) });
    shore.setNight(dusk);
    signs.setNight(dusk);
    for (const helicopter of helicopters) helicopter.setNight(dusk);
    fireworks.setNight(dusk * (1 - storm));
    // Dust and spray only scatter the light around them: dim them with the day and the clouds
    const daylight = Math.max(day * (1 - storm * 0.5), 0.06) + flash * 0.8;
    debris.setDaylight(daylight);
    spray.setDaylight(daylight);
  };
  const setHour = (value: number) => {
    hour = value;
    applyLight(0);
    skyChanged = true;
  };
  setHour(DUSK);

  const state: DaylightState = {
    get storm() {
      return storm;
    },
    set storm(value: number) {
      storm = value;
    },
    get skyChanged() {
      return skyChanged;
    },
    set skyChanged(value: boolean) {
      skyChanged = value;
    },
    get sinceBake() {
      return sinceBake;
    },
    set sinceBake(value: number) {
      sinceBake = value;
    },
  };

  return { setHour, applyLight, state };
}
