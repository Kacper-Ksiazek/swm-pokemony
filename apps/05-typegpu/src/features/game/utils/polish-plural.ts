/**
 * Polish plural form for a count: 1 pole, 2–4 pola, 5+ pól (and 12–14 pól, 22–24 pola, …).
 */
export function polishPlural(count: number, one: string, few: string, many: string) {
  const lastDigit = count % 10;
  const lastTwo = count % 100;

  if (count === 1) {
    return one;
  }

  return lastDigit >= 2 && lastDigit <= 4 && (lastTwo < 12 || lastTwo > 14) ? few : many;
}
