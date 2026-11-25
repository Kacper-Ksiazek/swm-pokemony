import { cameras, lighting, Particle, particles, type table } from "@typegpu/kit";
import { d, std, type TgpuComputePass, type TgpuRoot } from "typegpu";

/** Raindrops alive at once, and how many fall each second in a full storm. */
const CAPACITY = 12000;
const RAINFALL = 5000;
/** Where rain starts: a slab over the whole town, this high up and this wide. */
const CLOUD_HEIGHT = 55;
const CLOUD_HALF = 105;
const FALL = 26;
/** Length of a falling drop's streak, in metres. */
const STREAK = 1.1;
/** Seconds for the storm to build up or die down. */
const BUILD = 3;
/** Seconds between strokes of lightning: the shortest and the longest wait. */
const WAIT = [2.5, 8] as const;
const FLASH_INTENSITY = 900;
const FLASH_RANGE = 400;

/** Stretches a drop into a streak along its fall, as wide as its size and facing the eye. */
const streak = (drop: Particle, corner: d.v2f) => {
  "use gpu";
  const down = std.normalize(drop.velocity);
  const toEye = std.normalize(cameras.current.$.position - drop.position);
  const across = std.normalize(std.cross(down, toEye));
  return drop.position + across * (corner.x * drop.size * 0.5) + down * (corner.y * STREAK * 0.5);
};

/** A faint grey streak, densest down its middle. */
const sheen = (drop: Particle, local: d.v2f) => {
  "use gpu";
  const alpha = (1 - std.abs(local.x)) * (1 - local.y * local.y) * drop.color.w;
  return d.vec4f(drop.color.xyz * alpha, alpha);
};

/**
 * A storm that rolls in and out: rain falls over the whole town in streaks, and lightning
 * strikes now and then, lighting the town from above for a moment with a flicker.
 */
export function createWeather(
  root: TgpuRoot,
  view: cameras.CameraBase,
  lamps: table.Table<typeof lighting.PointLight>,
  options: { step: number; random: () => number },
) {
  const { random } = options;
  const rain = particles.create(root, view, {
    capacity: CAPACITY,
    step: options.step,
    label: "rain",
    blend: "over",
    place: streak,
    shade: sheen,
    settings: { gravity: [0, -4, 0], drag: 0 },
  });
  const cloud = {
    position: [0, CLOUD_HEIGHT, 0] as [number, number, number],
    area: [CLOUD_HALF, 4, CLOUD_HALF] as const,
    velocity: [2, -FALL, 1] as const,
    color: [0.72, 0.76, 0.82, 0.32] as const,
    size: 0.06,
    life: (CLOUD_HEIGHT + 6) / FALL,
    variance: 0.1,
    aged: true,
  };
  const shower = rain.stream(0, cloud);
  const bolt = lamps.add({
    position: [0, 110, 0],
    color: [0.8, 0.85, 1],
    intensity: 0,
    range: FLASH_RANGE,
  });

  let wanted = 0;
  let level = 0;
  let wait = WAIT[0];
  /** Seconds since the last stroke began, which shapes its double flicker. */
  let since = 10;
  let flash = 0;

  return {
    drawing: rain.drawing,
    initAsync: () => rain.initAsync(),

    /** Calls the storm in, or sends it away. */
    setStorm(on: boolean) {
      wanted = on ? 1 : 0;
    },

    /** How stormy it is, from 0 for clear skies to 1 for a full storm. */
    get level() {
      return level;
    },

    /** How bright the lightning is right now, from 0 to 1. */
    get flash() {
      return flash;
    },

    /** Builds or calms the storm by `dt` real seconds and times the lightning. */
    update(dt: number) {
      level += Math.sign(wanted - level) * Math.min(Math.abs(wanted - level), dt / BUILD);
      shower.rate = RAINFALL * level;

      wait -= dt;
      since += dt;
      if (level > 0.7 && wait <= 0) {
        since = 0;
        wait = WAIT[0] + random() * (WAIT[1] - WAIT[0]);
        lamps.write(bolt, {
          position: [(random() - 0.5) * 160, 110, (random() - 0.5) * 140],
        });
      }
      // A stroke flashes twice, the second dimmer, then dies away
      const first = Math.max(0, 1 - since / 0.08);
      const second = since > 0.16 ? Math.max(0, 0.7 - (since - 0.16) / 0.12) : 0;
      flash = Math.max(first, second) * level;
      lamps.write(bolt, { intensity: FLASH_INTENSITY * flash });
    },

    spawn(pass: TgpuComputePass) {
      rain.spawn(pass);
    },

    step(pass: TgpuComputePass) {
      rain.step(pass);
    },

    compact(pass: TgpuComputePass, ahead: number) {
      rain.compact(pass, ahead);
    },

    destroy() {
      rain.destroy();
    },
  };
}
