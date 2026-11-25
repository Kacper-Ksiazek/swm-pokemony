export type Random = () => number;

/** Fisher–Yates shuffle into a new array. */
export function shuffle<T>(items: T[], random: Random): T[] {
  const result = [...items];

  for (let index = result.length - 1; index > 0; index -= 1) {
    const swap = Math.floor(random() * (index + 1));

    [result[index], result[swap]] = [result[swap], result[index]];
  }

  return result;
}

export function pickRandom<T>(items: T[], random: Random): T {
  return items[Math.floor(random() * items.length)];
}

/** Up to `count` distinct items, in random order. */
export function pickSome<T>(items: T[], count: number, random: Random): T[] {
  return shuffle(items, random).slice(0, count);
}
