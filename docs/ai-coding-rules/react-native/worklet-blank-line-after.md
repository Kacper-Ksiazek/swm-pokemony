# Blank line after `"worklet";`

Put one empty line immediately after every `"worklet";` directive before the next statement. ESLint enforces this repo-wide (`local/worklet-blank-line-after`).

## Good

```ts
function clamp(value: number, min: number, max: number) {
  "worklet";

  return Math.min(Math.max(value, min), max);
}
```

## Bad

```ts
function clamp(value: number, min: number, max: number) {
  "worklet";
  return Math.min(Math.max(value, min), max);
}
```