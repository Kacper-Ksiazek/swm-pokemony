import { lighting, particles, type cameras, type table } from "@typegpu/kit";
import type { TgpuComputePass, TgpuRoot } from "typegpu";

import type { Vec3 } from "@/world/beach";

/** Sparks alive at once across every shell. */
const CAPACITY = 5000;
/** Seconds between launches at full night: the shortest and the longest wait. */
const WAIT = [0.9, 2.4] as const;
/** Seconds a rocket climbs before its shell bursts, and how fast it climbs. */
const CLIMB = 1.5;
const RISE = 26;
/** Sparks in one shell, and how fast they fly out. */
const SPARKS = 170;
const BURST = 13;
/** Lights for the flashes, used in turn, and how long a flash lasts. */
const FLASHES = 3;
const FLASH_SECONDS = 0.7;
const FLASH_INTENSITY = 90;
const FLASH_RANGE = 70;

/** Where barges out in the bay fire from. */
const PADS: readonly Vec3[] = [
  [-30, 0.6, -90],
  [8, 0.6, -94],
  [55, 0.6, -90],
];

/** Shell colours, bright past white so the bloom catches them. */
const SHELLS: readonly (readonly [number, number, number])[] = [
  [6, 1.2, 3.4],
  [1, 4.5, 6],
  [6, 4.4, 1],
  [2.4, 6, 1.6],
  [5, 5, 5],
  [4.6, 1.6, 6],
];

type Pending = { readonly at: Vec3; readonly color: (typeof SHELLS)[number]; left: number };
type Flash = {
  readonly row: ReturnType<table.Table<typeof lighting.PointLight>["add"]>;
  at: Vec3;
  color: (typeof SHELLS)[number];
  left: number;
};

/**
 * Fireworks over the bay at night. A rocket climbs from a barge, bursts into a ball of glowing
 * sparks that fall and fade, and its flash lights the water and the hotel fronts for a moment.
 */
export function createFireworks(
  root: TgpuRoot,
  view: cameras.CameraBase,
  lamps: table.Table<typeof lighting.PointLight>,
  options: { step: number; random: () => number },
) {
  const { random } = options;
  const sparks = particles.create(root, view, {
    capacity: CAPACITY,
    step: options.step,
    label: "fireworks",
    blend: "add",
    shade: particles.glowingDisc,
    settings: { gravity: [0, -5, 0], drag: 1.1 },
  });
  const flashes: Flash[] = Array.from({ length: FLASHES }, () => ({
    row: lamps.add({ position: [0, -50, 0], color: [1, 1, 1], intensity: 0, range: FLASH_RANGE }),
    at: [0, -50, 0],
    color: SHELLS[0],
    left: 0,
  }));
  const pending: Pending[] = [];
  let wait = 1;
  let next = 0;
  let night = 0;
  /** False once the show is over: shells in the air still burst, but no more go up. */
  let on = true;

  const launch = () => {
    const pad = PADS[Math.floor(random() * PADS.length)];
    const color = SHELLS[Math.floor(random() * SHELLS.length)];
    const drift = (random() - 0.5) * 6;
    sparks.burst({
      count: 1,
      position: pad,
      velocity: [drift, RISE, (random() - 0.5) * 4],
      color: [3, 2.2, 1.4, 1],
      size: 0.6,
      life: CLIMB,
      variance: 0,
    });
    // Where the shell bursts: up its climb, with gravity and drag taking their share
    pending.push({
      at: [pad[0] + drift * CLIMB * 0.7, pad[1] + RISE * CLIMB * 0.62, pad[2]],
      color,
      left: CLIMB,
    });
  };

  const explode = (shell: Pending) => {
    sparks.burst({
      count: SPARKS,
      position: shell.at,
      scatter: BURST,
      color: [...shell.color, 1],
      size: 0.55,
      life: 2,
      variance: 0.35,
    });
    const flash = flashes[next];
    next = (next + 1) % FLASHES;
    flash.at = shell.at;
    flash.color = shell.color;
    flash.left = FLASH_SECONDS;
  };

  return {
    drawing: sparks.drawing,
    initAsync: () => sparks.initAsync(),

    /** Fireworks fly only once it is dark enough, from 0 by day to 1 at night. */
    setNight(amount: number) {
      night = amount;
    },

    /** Ends the show, or starts it again; shells already in the air still burst. */
    setOn(value: boolean) {
      on = value;
    },

    /** Times launches and bursts by `dt` real seconds and fades the flashes. */
    update(dt: number) {
      wait -= dt;
      if (on && night > 0.6 && wait <= 0) {
        launch();
        wait = WAIT[0] + random() * (WAIT[1] - WAIT[0]);
      }
      for (let i = pending.length - 1; i >= 0; i--) {
        pending[i].left -= dt;
        if (pending[i].left > 0) continue;
        explode(pending[i]);
        pending.splice(i, 1);
      }
      for (const flash of flashes) {
        flash.left = Math.max(0, flash.left - dt);
        const strength = (flash.left / FLASH_SECONDS) ** 2;
        const peak = Math.max(...flash.color);
        lamps.write(flash.row, {
          position: flash.at,
          color: [flash.color[0] / peak, flash.color[1] / peak, flash.color[2] / peak],
          intensity: FLASH_INTENSITY * strength,
        });
      }
    },

    spawn(pass: TgpuComputePass) {
      sparks.spawn(pass);
    },

    step(pass: TgpuComputePass) {
      sparks.step(pass);
    },

    compact(pass: TgpuComputePass, ahead: number) {
      sparks.compact(pass, ahead);
    },

    destroy() {
      sparks.destroy();
    },
  };
}
