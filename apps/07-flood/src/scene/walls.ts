import { createWalls } from "@/walls";
import { createWater } from "@/water";
import { CELLS, type Layout } from "@/world/layout";
import { createCollapse } from "@/world/collapse";
import {
  lengthOf,
  makeWall,
  panelCount,
  panelsOf,
  PANELS,
  rasterize,
  SHORTEST,
  snap,
  strengthOf as panelStrengthOf,
  wallNear,
  type Panel,
  type Point,
  type Wall,
} from "@/world/walls";

type GpuWalls = ReturnType<typeof createWalls>;
type Water = ReturnType<typeof createWater>;

export function createPlayerWalls(parts: {
  walls: GpuWalls;
  water: Water;
  layout: Layout;
  solid: Float32Array;
}) {
  const { walls, water, layout, solid } = parts;
  const standing: Wall[] = [];
  const panels: Panel[] = [];
  /** Section slots not in use, which number each section's push, strain and row. */
  const free = Array.from({ length: PANELS }, (_, i) => PANELS - 1 - i);
  const breaches = createCollapse(new Float32Array(PANELS), layout.buildings.length);
  let nextWall = 1;
  /**
   * How high the walls stand above the ground per cell and which section stands there, then what
   * the water meets: the higher of the buildings and the walls, and their owner.
   */
  const wallHeights = new Float32Array(CELLS * CELLS);
  const wallOwners = new Uint32Array(CELLS * CELLS);
  const obstacles = new Float32Array(CELLS * CELLS);
  const owners = new Uint32Array(CELLS * CELLS);
  const rebuild = () => {
    for (let i = 0; i < obstacles.length; i++) obstacles[i] = Math.max(solid[i], wallHeights[i]);
    water.rebuild(obstacles);
  };
  const rewall = () => {
    rasterize(
      panels,
      (slot) => breaches.falls[slot] !== undefined,
      layout.ground,
      wallHeights,
      wallOwners,
      layout.buildings.length,
    );
    for (let i = 0; i < owners.length; i++) owners[i] = layout.owner[i] || wallOwners[i];
    water.reowner(owners);
    rebuild();
  };
  const unbuild = (wall: Wall) => {
    for (let i = panels.length - 1; i >= 0; i--) {
      if (panels[i].wall !== wall.id) continue;
      const [panel] = panels.splice(i, 1);
      walls.remove(panel.slot);
      breaches.place(panel.slot, 0);
      free.push(panel.slot);
    }
  };

  return {
    panels,
    breaches,
    rewall,
    rebuild,
    obstacles,

    /** Shows the wall that a drag from `from` to `to` would build, snapped to the grid. */
    draft(from: Point | undefined, to: Point | undefined, height: number) {
      const a = from && snap(from);
      const b = to && snap(to);
      walls.preview(a && b && lengthOf(a, b) >= SHORTEST ? makeWall(0, a, b, height) : undefined);
    },

    /** Builds a wall between two points; false when it is too short or too many walls stand. */
    build(from: Point, to: Point, height: number) {
      walls.preview(undefined);
      const a = snap(from);
      const b = snap(to);
      if (lengthOf(a, b) < SHORTEST || panelCount(a, b) > free.length) return false;
      const wall = makeWall(nextWall++, a, b, height);
      standing.push(wall);
      const slots = Array.from({ length: panelCount(a, b) }, () => free.pop()!);
      for (const panel of panelsOf(wall, slots)) {
        panels.push(panel);
        walls.add(panel);
        breaches.place(panel.slot, panelStrengthOf(panel));
      }
      rewall();

      return true;
    },

    /** The wall near a ground point, which the pointer would remove, tinted red. */
    markWallAt(point: Point | undefined) {
      const wall = point && wallNear(standing, point);
      walls.mark(wall ? wall.id : undefined);

      return wall?.id;
    },

    removeWall(id: number) {
      const index = standing.findIndex((wall) => wall.id === id);
      if (index < 0) return;
      const [wall] = standing.splice(index, 1);
      unbuild(wall);
      rewall();
    },

    clearWalls() {
      for (const wall of standing) unbuild(wall);
      standing.length = 0;
      rewall();
    },

    get wallCount() {
      return standing.length;
    },
  };
}
