---
name: explain-swift
description: >-
  Explains Swift code snippets in plain language and maps them to TypeScript
  mental models (including Expo native modules). Use when the user asks what
  Swift code does, pastes or selects .swift files, compares Swift to TypeScript,
  or works on iOS modules in this repo.
---

# Explain Swift

## Quick start

When the user wants to understand Swift (snippet, file, or selection):

1. **Scope** — Use only the snippet they pointed at; read the open file or cited path for imports and surrounding types if needed.
2. **Explain** — What it does at runtime, in order of execution (not alphabetically by syntax).
3. **TypeScript intuition** — Equivalent TS/React Native patterns; call out what has no 1:1 match.
4. **Gaps** — Memory (ARC), threading, UIKit lifecycle, bridging to JS — only when relevant.

Respond in the **same language as the user** (Polish or English).

## Workflow

```
- [ ] Confirm snippet boundaries (selection vs whole file)
- [ ] Note imports/framework (ExpoModulesCore, UIKit, Foundation, …)
- [ ] Summarize purpose in one sentence
- [ ] Walk through logic (blocks, callbacks, property wrappers)
- [ ] TypeScript mental model + illustrative TS (not required to compile)
- [ ] Flag Swift-only pitfalls if they affect the snippet
```

Do **not** rewrite production code unless asked. Do **not** lecture on all of Swift — stay tied to the snippet.

## Output template

Use this structure (adjust depth to snippet size):

```markdown
## Po co to jest
[1–2 zdania: cel fragmentu w aplikacji / module]

## Co się dzieje krok po kroku
[Numerowana lista lub krótkie akapity — kolejność wykonania]

## W TypeScripcie (intuicja)
[Jak myślałbyś o tym w TS/RN — typy, obiekty, callbacki, Promise]

\`\`\`typescript
// Odpowiednik konceptualny (może być pseudokod)
\`\`\`

## Różnice, na które warto uważać
[Bullets tylko jeśli coś istotnego: optional, protocol, MainActor, weak self, NSError, …]

## W tym repo (opcjonalnie)
[Jeśli dotyczy Expo Module: jak to łączy się z `modules/*/src/*.ts`]
```

English users: same sections — **What it's for**, **Step by step**, **TypeScript intuition**, **Watch out for**, **In this repo**.

## Repo context (Expo native modules)

When Swift lives under `apps/*/modules/**/ios/`:

| Swift (Expo Modules Core) | TypeScript side |
|---------------------------|-----------------|
| `Module`, `definition()` | Class extending native module; config in `expo-module.config.json` |
| `Name("…")` | JS module name / `requireNativeModule` |
| `AsyncFunction("…") { … }` | Async method on `NativeModule` in `*Module.ts` |
| `Function("…")` | Sync method |
| `Events("…")` | `addListener` / `EventEmitter` from expo-modules-core |
| `Property("…")` | Readable/writable props on the module object |

Read the sibling `src/KksiazekDeviceOrientationModule.ts` (or equivalent) when explaining bridge code so the JS contract matches the explanation.

## Depth rules

| Snippet size | Behavior |
|--------------|----------|
| ≤15 lines | Line-by-line or tight blocks |
| 16–80 lines | Sections by responsibility |
| >80 lines | High-level flow first, then zoom only on parts the user highlighted |

If the snippet is incomplete (missing imports, `…`), say what you assume and what you'd need to be sure.

## Additional resources

- Swift ↔ TS construct cheat sheet: [swift-ts-map.md](swift-ts-map.md)
- Worked example (Expo module stub): [examples.md](examples.md)
