import { CENTER, RADIUS, SEGMENTS } from "../line-to-circle.constants";

/** Continuous open-path morph from horizontal diameter (0) → top semicircle (0.5) → closed circle (1); phases meet at 0.5. */
export function lineToCirclePath(progress: number) {
  "worklet";

  let path = "";

  if (progress <= 0.5) {
    const bend = progress * 2;

    for (let index = 0; index <= SEGMENTS; index += 1) {
      const t = -1 + (2 * index) / SEGMENTS;
      const halfPiT = (t * Math.PI) / 2;

      const x = CENTER + RADIUS * ((1 - bend) * t + bend * Math.sin(halfPiT));
      const y = CENTER - bend * RADIUS * Math.cos(halfPiT);

      path += index === 0 ? `M ${x} ${y}` : ` L ${x} ${y}`;
    }

    return path;
  }

  const maxAngle = Math.PI * progress;

  for (let index = 0; index <= SEGMENTS; index += 1) {
    const t = -1 + (2 * index) / SEGMENTS;
    const angle = -Math.PI / 2 + t * maxAngle;

    const x = CENTER + RADIUS * Math.cos(angle);
    const y = CENTER + RADIUS * Math.sin(angle);

    path += index === 0 ? `M ${x} ${y}` : ` L ${x} ${y}`;
  }

  return progress > 0.995 ? `${path} Z` : path;
}
