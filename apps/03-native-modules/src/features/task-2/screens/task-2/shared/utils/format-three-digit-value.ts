const MIN_VALUE = 0;
const MAX_VALUE = 999;

export function clampThreeDigitValue(value: number): number {
  return Math.min(MAX_VALUE, Math.max(MIN_VALUE, Math.round(value)));
}

export function formatThreeDigitValue(value: number): string {
  return String(clampThreeDigitValue(value)).padStart(3, "0");
}

export function randomNumericDelta(): number {
  return Math.floor(Math.random() * 26);
}
