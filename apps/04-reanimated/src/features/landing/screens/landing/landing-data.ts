import type { Href } from "expo-router";

import type { ExerciseIconName } from "@/components/icon-symbol";

export type ExerciseStatus = "done" | "todo";

export type DemoItem = {
  title: string;
  subtitle: string;
  href: Href;
  icon: ExerciseIconName;
  status: ExerciseStatus;
};

export type ExerciseFilter = "all" | "todo" | "done";

export const EXERCISE_FILTER_LABELS: Record<ExerciseFilter, string> = {
  all: "Wszystkie",
  todo: "TODO",
  done: "Ukończone",
};

export const DEMO_SECTIONS: { title: string; items: DemoItem[] }[] = [
  {
    title: "Exercises",
    items: [
      {
        title: "Stars 2D",
        subtitle: "01-stars-2d · 2D star field",
        href: "/stars-2d",
        icon: "star.fill",
        status: "todo",
      },
      {
        title: "SVG circle",
        subtitle: "02-svg-circle · Animated SVG circle",
        href: "/svg-circle",
        icon: "circle.fill",
        status: "todo",
      },
      {
        title: "Stars 3D",
        subtitle: "03-stars-3d · 3D parallax star field",
        href: "/stars-3d",
        icon: "cube.fill",
        status: "todo",
      },
      {
        title: "Physics ball",
        subtitle: "04-physics-ball · Physics-based ball motion",
        href: "/physics-ball",
        icon: "basketball.fill",
        status: "todo",
      },
      {
        title: "Keyboard handler",
        subtitle: "05-keyboard-handler · Keyboard-driven animations",
        href: "/keyboard-handler",
        icon: "keyboard.fill",
        status: "todo",
      },
      {
        title: "Scroll onboarding",
        subtitle: "06-scroll-onboarding · Scroll-linked onboarding",
        href: "/scroll-onboarding",
        icon: "arrow.up.arrow.down",
        status: "todo",
      },
      {
        title: "Sensors",
        subtitle: "07-sensors · Accelerometer / gyroscope",
        href: "/sensors",
        icon: "sensor.tag.radiowaves.forward.fill",
        status: "todo",
      },
      {
        title: "Shared transition",
        subtitle: "08-shared-element-transition · Shared element transitions",
        href: "/shared-element-transition",
        icon: "square.on.square",
        status: "todo",
      },
      {
        title: "Skia",
        subtitle: "09-skia · Skia + Reanimated",
        href: "/skia",
        icon: "paintbrush.pointed.fill",
        status: "todo",
      },
      {
        title: "Chess",
        subtitle: "10-chess · Interactive chessboard",
        href: "/chess",
        icon: "square.grid.3x3.fill",
        status: "todo",
      },
    ],
  },
];

export function filterDemoItems(
  items: DemoItem[],
  query: string,
  filter: ExerciseFilter,
): DemoItem[] {
  const normalizedQuery = query.trim().toLowerCase();

  return items.filter((item) => {
    if (filter === "todo" && item.status !== "todo") {
      return false;
    }
    if (filter === "done" && item.status !== "done") {
      return false;
    }
    if (!normalizedQuery) {
      return true;
    }

    const haystack = `${item.title} ${item.subtitle}`.toLowerCase();
    return haystack.includes(normalizedQuery);
  });
}
