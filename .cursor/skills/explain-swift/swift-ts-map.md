# Swift ↔ TypeScript — mental map

Use for **intuition**, not as a literal translator. TypeScript has no exact match for many Swift features.

## Types and values

| Swift | TypeScript intuition |
|-------|----------------------|
| `let x = 1` | `const x = 1` — binding, not deep immutability of objects |
| `var x = 1` | `let x = 1` with reassignment: use `let` + new binding or a mutable container |
| `Int`, `Double`, `String`, `Bool` | `number`, `number`, `string`, `boolean` |
| `Optional<T>` / `T?` | `T \| null \| undefined` or `T?` with strict null checks |
| `if let x = optional` | `if (x != null) { … }` or early return |
| `guard let x = optional else { return }` | Early return when null/invalid |
| `struct Foo` | Plain object or `type Foo = { … }` — value semantics in Swift differ |
| `class Foo` | `class Foo` — reference type (like JS objects) |
| `enum E { case a, b }` | Union `'a' \| 'b'` or `enum E { A = 'a', B = 'b' }` |
| `enum E { case ok(String); case err(Error) }` | Discriminated union `{ kind: 'ok', value: string } \| { kind: 'err', error: … }` |
| `protocol P` | `interface P` — structural in TS; Swift requires explicit conformance |
| `extension Foo { }` | Augment type in another file — TS: declaration merging / separate helpers |
| `typealias Handler = (Int) -> Void` | `type Handler = (n: number) => void` |
| `@escaping (() -> Void)` | Callback stored for later — same as passing `() => void` you call async |
| `throws` / `try` | `async` functions that reject, or Result-style returns |
| `async`/`await` (Swift concurrency) | `async`/`await` in TS — different runtime, similar syntax |
| `Task { }` | `void (async () => { … })()` or `Promise` chain |
| `@MainActor` | “Run on UI thread” — in RN often implied on JS thread; native UI must dispatch to main |

## Properties and accessors

| Swift | TypeScript intuition |
|-------|----------------------|
| `var count: Int { get set }` | Getter/setter on object or class field |
| `lazy var x` | Initialize on first read — `get lazyX() { … }` or memoized field |
| `willSet` / `didSet` | No direct equivalent — use setter or proxy |

## Memory and closures

| Swift | TypeScript intuition |
|-------|----------------------|
| ARC (`strong` default) | GC in JS — no retain cycles in pure TS, but RN native refs can leak |
| `[weak self]` in closures | `const self = this` pattern or arrow functions; breaks cycles in Swift only |
| `unowned` | Assumes object still alive — rare analogue in TS |

## UIKit / platform (brief)

| Swift | TypeScript intuition |
|-------|----------------------|
| `UIViewController` | No RN equivalent in JS — native screen host |
| `NotificationCenter` | `EventEmitter`, `DeviceEventEmitter`, or Expo `Events` |
| `UIDevice.current.orientation` | Native state read — expose via module method to JS |

## Expo Modules Core DSL

The `definition() { … }` block is a **builder DSL**, not normal imperative Swift at module load time:

```typescript
// Intuition only
function defineModule(builder: (def: ModuleDef) => void) {
  const def = new ModuleDef();
  builder(def);
  return def;
}

defineModule((def) => {
  def.name('KksiazekDeviceOrientation');
  def.event('onOrientationChange');
  def.asyncFunction('getOrientationAsync', async () => 'portrait');
});
```

Real registration happens in native code; JS sees the generated bridge from `expo-module.config.json` + TypeScript wrappers.
