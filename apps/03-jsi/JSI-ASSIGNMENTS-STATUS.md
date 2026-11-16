# JSI assignments — completion

| Status                     | Znaczenie                                                               |
| -------------------------- | ----------------------------------------------------------------------- |
| ⬜ **TO_DO**               | Brak w repo (ani sensownego zamiennika)                                 |
| ✅ **Completed**           | Zgodnie ze slajdem (nazwy + zachowanie)                                 |
| 🚀 **Completed + stretch** | Ten sam cel JSI, inne API i/lub tab w aplikacji (szczegóły w **Notes**) |

_Installer hooks `task1`–`task13` are wired in `JsiInstaller.cpp`; the file prefix `task-NN` is the hook number, which is not always the assignment number (see Notes)._

**Repo wiring:** `modules/kksiazek-jsi/cpp/JsiInstaller.cpp` runs installer hooks `task1`–`task13` (`task-0N-*.cpp` plus `task-10`–`task-13`). Installer numbers are **not** always the same as assignment numbers — see Notes.

|   # | Topic (short)                   | Status                 | Notes                                                                                                                                                    |
| --: | ------------------------------- | ---------------------- | -------------------------------------------------------------------------------------------------------------------------------------------------------- |
|   1 | Global `42`                     | 🚀 Completed + stretch | As spec: `task-01-answer-int.cpp` · **Native Data** tab                                                                                                  |
|   2 | Global `isWednesday`            | 🚀 Completed + stretch | As spec: `task-02-boolean.cpp` · **Native Data** tab                                                                                                     |
|   3 | Global string                   | 🚀 Completed + stretch | Instead of `workshopsName` / `"App.js"`: `workshopName` + `"JSI workshop"` (`task-03-string.cpp`)                                                        |
|   4 | Global array                    | ✅ Completed           | `myAwesomeArray` in `task-04-array.cpp` (third element `"JSI workshop"` vs slide `"App.js"`)                                                             |
|   5 | `giveMeFive()`                  | 🚀 Completed + stretch | Instead of `giveMeFive`: `counter` global + `increment` / `decrement` HostFunctions (`task-05-counter.cpp`) · **Counter** tab                            |
|   6 | `sumMeThis(a, b)`               | 🚀 Completed + stretch | Instead of `sumMeThis`: `calculate([a, b], "add")` (and subtract/multiply) (`task-06-calculator.cpp`) · **Counter** tab                                  |
|   7 | `divideMeThis` + div-by-zero    | ✅ Completed           | `divideMeThis(a, b)` with `JSError` on divide-by-zero (`task-13-divide.cpp`, installer hook `task13`) · **Divide** tab                                   |
|   8 | `reverseMeThis`                 | 🚀 Completed + stretch | Instead of `reverseMeThis(str)`: `transformString(str, "reverse")` plus other ops (`task-07-transform-string.cpp`) · **Strings** tab                     |
|   9 | `sumMeThisObject`               | ✅ Completed           | `sumMeThisObject({ firstNum, lastNum })` → `{ result }` (`task-11-sum-object.cpp`, hook `task11`) · **Object Sum** tab                                   |
|  10 | `sumMeThisArray`                | 🚀 Completed + stretch | Instead of `sumMeThisArray`: `calculate(numbers, "add")` over a number array (`task-06-calculator.cpp`) · **Counter** tab                                |
|  11 | `nativeMap`                     | 🚀 Completed + stretch | As spec: `task-08-native-map.cpp` · **Array Map** tab                                                                                                    |
|  12 | `runJsFunction` → `console.log` | 🚀 Completed + stretch | Instead of global `runJsFunction`: `jsLog()` in `workshop-log.cpp` gets `global.console.log` and calls it from C++ (used from `JsiInstaller` at startup) |
|  13 | `getDateObject` HostObject      | 🚀 Completed + stretch | As spec (+ setters): `task-09-date.cpp` · **Date** tab                                                                                                   |
|  14 | `getInfinityObject`             | 🚀 Completed + stretch | `InfinityObject` HostObject with read-increments / write-decrements counter (`task-10-infinity.cpp`, installer hook `task10`) · **Counter** tab          |
|  15 | Native state on `simpleObject`  | 🚀 Completed + stretch | `trackNativeState(obj)` attaches `CounterNativeState` (`task-12-native-state.cpp`, hook `task12`) · **Native State** tab                                 |

## Summary

| Status                 | Count |
| ---------------------- | ----: |
| ⬜ TO_DO               |     0 |
| ✅ Completed           |     3 |
| 🚀 Completed + stretch |    12 |

```text
Assignments:     15 total — all implemented
Installer hooks: task1–task13 in C++ (wired in JsiInstaller.cpp)
```
