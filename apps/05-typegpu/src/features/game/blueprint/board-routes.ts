import type { BoardRouteSpec } from "./board-blueprint.types";

/**
 * The road, as one start tile and six routes.
 *
 * ```text
 *   start ─┬─ college ─┐
 *          └─ career ──┴─ main (winding loops) ─┬─ family ────┐
 *                                               └─ adventure ─┴─ golden ── retire
 * ```
 */
export const BOARD_ROUTE_SPECS: BoardRouteSpec[] = [
  {
    id: "start",
    title: "Start",
    region: "coast",
    path: [{ x: 9.2, z: 9.2 }],
    pattern: ["start"],
    specials: [{ at: 0, kind: "start", label: "Start" }],
    continuesTo: ["college", "career"],
  },
  {
    id: "college",
    title: "Droga przez studia",
    region: "campus",
    path: [
      { x: 8, z: 5.4 },
      { x: 8.7, z: 2.6 },
      { x: 8.6, z: -0.8 },
      { x: 7, z: -2.4 },
      { x: 4.6, z: -1.6 },
      { x: 3.6, z: 1 },
      { x: 3.4, z: 3.8 },
    ],
    pattern: ["event", "action", "event", "payday"],
    specials: [
      { at: 0, kind: "action", label: "Immatrykulacja", action: "enroll" },
      { at: "last", kind: "stop", label: "Obrona dyplomu", action: "graduate" },
    ],
    continuesTo: ["main"],
  },
  {
    id: "career",
    title: "Droga do kariery",
    region: "downtown",
    path: [
      { x: 5.6, z: 7.9 },
      { x: 4.4, z: 7.4 },
    ],
    pattern: ["event", "payday", "event", "action"],
    specials: [{ at: 0, kind: "career", label: "Pierwsza praca" }],
    continuesTo: ["main"],
  },
  {
    id: "main",
    title: "Droga życia",
    region: "suburbs",
    path: [
      { x: 0.4, z: 6.4 },
      { x: -1.8, z: 7 },
      { x: -4.4, z: 8.6 },
      { x: -7.6, z: 8.4 },
      { x: -9, z: 6 },
      { x: -7.6, z: 3.8 },
      { x: -4.8, z: 4.6 },
      { x: -2.4, z: 4.2 },
      { x: -0.8, z: 2 },
      { x: -2, z: -0.2 },
      { x: -4.8, z: 0.6 },
      { x: -7.6, z: 0.6 },
      { x: -9.2, z: -1.6 },
      { x: -8.8, z: -4.4 },
      { x: -6.8, z: -5.8 },
      { x: -4.6, z: -5.4 },
    ],
    pattern: ["event", "action", "event", "event", "payday", "event", "action"],
    specials: [
      { at: 0, kind: "career", label: "Wybór zawodu" },
      { at: 5, kind: "stop", label: "Ślub", action: "wedding" },
      { at: 12, kind: "house", label: "Kupno domu" },
      { at: 20, kind: "baby", label: "Dziecko" },
      { at: 28, kind: "pet", label: "Adopcja zwierzaka" },
      { at: "last", kind: "stop", label: "Rozdroże" },
    ],
    continuesTo: ["family", "adventure"],
  },
  {
    id: "family",
    title: "Ścieżka rodzinna",
    region: "meadow",
    path: [
      { x: -1.2, z: -6.5 },
      { x: 0.4, z: -7.5 },
    ],
    pattern: ["event", "baby", "event", "payday"],
    specials: [{ at: 4, kind: "house", label: "Większy dom" }],
    continuesTo: ["golden"],
  },
  {
    id: "adventure",
    title: "Ścieżka przygód",
    region: "alpine",
    path: [
      { x: -0.8, z: -4.6 },
      { x: 0.6, z: -5.8 },
    ],
    pattern: ["action", "event", "payday", "event"],
    specials: [{ at: 2, kind: "pet", label: "Pies górski" }],
    continuesTo: ["golden"],
  },
  {
    id: "golden",
    title: "Złota jesień",
    region: "harbor",
    path: [
      { x: 3.6, z: -7 },
      { x: 5.6, z: -7.2 },
      { x: 7.6, z: -8.4 },
      { x: 8.9, z: -6.6 },
      { x: 8.2, z: -4.6 },
      { x: 6.2, z: -4.4 },
    ],
    pattern: ["event", "payday", "event", "action", "event"],
    specials: [
      { at: 6, kind: "stop", label: "Kryzys wieku średniego", action: "midlife" },
      { at: 9, kind: "payday", label: "Premia", action: "bonus" },
      { at: "last", kind: "retire", label: "Emerytura" },
    ],
    continuesTo: [],
  },
];
