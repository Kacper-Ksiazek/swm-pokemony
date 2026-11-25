import { instances, type meshPool } from "@typegpu/kit";
import { meshes } from "@typegpu/kit/geometry";
import type { TgpuRoot } from "typegpu";

import { multiply, rotate, turnAbout, type Quaternion, type Vec3 } from "@/world/beach";

const COUNT = 40;
/** Where the flock wheels over the beach, and how far from its centre. */
const HOME: Vec3 = [0, 18, -52];
const RANGE = 55;
/** Where it flees to when the wave comes, high over the town, and for how long. */
const REFUGE: Vec3 = [10, 48, 70];
const FLEE_SECONDS = 18;
/** Cruising and fleeing speeds, in metres per second. */
const CRUISE = 9;
const DASH = 16;
/** Neighbour distances for keeping apart and for flocking together, in metres. */
const APART = 3;
const FLOCK = 12;

const WHITE: readonly [number, number, number] = [0.94, 0.94, 0.92];
const GREY: readonly [number, number, number] = [0.6, 0.62, 0.66];

type Bird = { position: Vec3; velocity: Vec3; phase: number };

const length3 = (v: Vec3) => Math.hypot(v[0], v[1], v[2]);
const scale = (v: Vec3, s: number): Vec3 => [v[0] * s, v[1] * s, v[2] * s];
const add = (a: Vec3, b: Vec3): Vec3 => [a[0] + b[0], a[1] + b[1], a[2] + b[2]];
const sub = (a: Vec3, b: Vec3): Vec3 => [a[0] - b[0], a[1] - b[1], a[2] - b[2]];

/**
 * A flock of gulls wheeling over the beach: they keep apart, fly with their neighbours and circle
 * home. When the wave comes they scatter up and inland, and drift back once it has passed.
 */
export function createGulls(root: TgpuRoot, pool: meshPool.MeshPool, random: () => number) {
  const box = pool.add(meshes.box());
  const parts = instances.create(root, pool, { capacity: COUNT * 3 });
  const birds: Bird[] = Array.from({ length: COUNT }, () => {
    const angle = random() * Math.PI * 2;
    return {
      position: [
        HOME[0] + Math.cos(angle) * RANGE * random(),
        HOME[1] + (random() - 0.5) * 8,
        HOME[2] + Math.sin(angle) * RANGE * 0.4 * random(),
      ],
      velocity: [Math.sin(angle) * CRUISE, 0, -Math.cos(angle) * CRUISE],
      phase: random() * Math.PI * 2,
    };
  });
  const rows = birds.map(() => [
    parts.add(box, { scale: [0.28, 0.24, 0.9], color: WHITE, roughness: 0.6 }),
    parts.add(box, { scale: [1.1, 0.05, 0.42], color: GREY, roughness: 0.6 }),
    parts.add(box, { scale: [1.1, 0.05, 0.42], color: GREY, roughness: 0.6 }),
  ]);
  let fleeing = 0;
  let time = 0;

  return {
    renderer: parts.renderer(),

    /** The wave is coming: the flock takes off for the town. */
    startle() {
      fleeing = FLEE_SECONDS;
    },

    update(dt: number) {
      time += dt;
      fleeing = Math.max(0, fleeing - dt);
      const goal = fleeing > 0 ? REFUGE : HOME;
      const speed = fleeing > 0 ? DASH : CRUISE;

      for (const bird of birds) {
        let apart: Vec3 = [0, 0, 0];
        let heading: Vec3 = [0, 0, 0];
        let centre: Vec3 = [0, 0, 0];
        let near = 0;
        for (const other of birds) {
          if (other === bird) continue;
          const offset = sub(bird.position, other.position);
          const distance = length3(offset);
          if (distance < APART && distance > 0) apart = add(apart, scale(offset, 1 / distance));
          if (distance < FLOCK) {
            heading = add(heading, other.velocity);
            centre = add(centre, other.position);
            near++;
          }
        }
        let steer = scale(apart, 2.5);
        if (near > 0) {
          steer = add(steer, scale(sub(scale(heading, 1 / near), bird.velocity), 0.4));
          steer = add(steer, scale(sub(scale(centre, 1 / near), bird.position), 0.15));
        }
        // Home pulls harder the farther a bird strays, and swirls the flock around it
        const toGoal = sub(goal, bird.position);
        const far = length3(toGoal);
        steer = add(steer, scale(toGoal, Math.min(far / RANGE, 1.5) * 0.6));
        steer = add(steer, scale([-toGoal[2], 0, toGoal[0]], (0.08 / Math.max(far, 1)) * speed));
        bird.velocity = add(bird.velocity, scale(steer, dt));
        const fast = length3(bird.velocity);
        bird.velocity = scale(bird.velocity, speed / Math.max(fast, 0.01));
        const moved = add(bird.position, scale(bird.velocity, dt));
        bird.position = [moved[0], Math.max(moved[1], 6), moved[2]];
      }

      birds.forEach((bird, i) => {
        const [vx, vy, vz] = bird.velocity;
        const yaw = Math.atan2(vx, vz);
        const climb = -Math.atan2(vy, Math.hypot(vx, vz));
        const body: Quaternion = multiply(turnAbout([0, 1, 0], yaw), turnAbout([1, 0, 0], climb));
        const flap = Math.sin(time * (fleeing > 0 ? 14 : 8) + bird.phase) * 0.6;
        parts.write(rows[i][0], { position: bird.position, rotation: body });
        for (const side of [-1, 1]) {
          const wing = multiply(body, turnAbout([0, 0, 1], side * flap));
          const root = rotate(body, [side * 0.12, 0.05, 0]);
          const tip = rotate(wing, [side * 0.55, 0, 0]);
          parts.write(rows[i][side < 0 ? 1 : 2], {
            position: add(add(bird.position, root), tip),
            rotation: wing,
          });
        }
      });
      parts.flush();
    },

    destroy() {
      parts.destroy();
    },
  };
}
