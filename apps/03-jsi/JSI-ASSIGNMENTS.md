# JSI assignments

Transcribed from the App.js JSI assignment deck. Implementations in this app live under `modules/kksiazek-jsi/` (not `NativeJSIWorkshopsModule.cpp`); use these tasks as the exercise spec.

**Progress:** [JSI-ASSIGNMENTS-STATUS.md](./JSI-ASSIGNMENTS-STATUS.md)

Legend: ✍️ — implement yourself · 👀 — follow along / reference solution in the deck

Reference files in the original materials:

- **JS usage:** `App.tsx` or `/src/App.tsx`
- **C++ solutions:** `/shared/NativeJSIWorkshopsModule.cpp`

---

## Task 1 ✍️

Inject int `42` to JS Runtime global object as property `answerToTheUltimateQuestionOfLifeTheUniverseAndEverything`.

**File:** `/App.tsx`

```typescript
const task1 = () => {
  console.log(answerToTheUltimateQuestionOfLifeTheUniverseAndEverything);
};
```

### Solution

**File:** `/shared/NativeJSIWorkshopsModule.cpp`

```cpp
void NativeJSIWorkshopsModule::task1(jsi::Runtime &rt) {
  const char *propertyName = "answerToTheUltimateQuestionOfLifeTheUniverseAndEverything";
  jsi::Value value = jsi::Value(42);
  rt.global().setProperty(rt, propertyName, value);
}
```

---

## Task 2 👀

Inject boolean `false` to JS Runtime global object as property `isWednesday`.

**File:** `/App.tsx`

```typescript
const task2 = () => {
  console.log(isWednesday);
};
```

### Solution

**File:** `/shared/NativeJSIWorkshopsModule.cpp`

```cpp
void NativeJSIWorkshopsModule::task2(jsi::Runtime &rt) {
  const char *propertyName = "isWednesday";
  jsi::Value value = jsi::Value(false);
  rt.global().setProperty(rt, propertyName, value);
}
```

---

## Task 3 ✍️

Inject string `App.js` to JS Runtime global object as property `workshopsName`.

**File:** `/App.tsx`

```typescript
const task3 = () => {
  console.log(workshopsName);
};
```

### Solution

**File:** `/shared/NativeJSIWorkshopsModule.cpp`

```cpp
void NativeJSIWorkshopsModule::task3(jsi::Runtime &rt) {
  const char *propertyName = "workshopsName";
  jsi::Value value = jsi::String::createFromUtf8(rt, "JSI Workshops");
  rt.global().setProperty(rt, propertyName, value);
}
```

---

## Task 4 ✍️

Inject array contains `[42, true, "App.js"]` to JS Runtime global object as property `myAwesomeArray`.

**File:** `/App.tsx`

```typescript
const task4 = () => {
  console.log(myAwesomeArray);
};
```

### Solution

**File:** `/shared/NativeJSIWorkshopsModule.cpp`

```cpp
void NativeJSIWorkshopsModule::task4(jsi::Runtime &rt) {
  const char *propertyName = "myAwesomeArray";
  jsi::Array arrayValue(rt, 3);
  arrayValue.setValueAtIndex(rt, 0, 42);
  arrayValue.setValueAtIndex(rt, 1, true);
  arrayValue.setValueAtIndex(rt, 2, "App.js");
  rt.global().setProperty(rt, propertyName, arrayValue);
}
```

---

## Task 5 ✍️

To JS Runtime global object inject function `giveMeFive` which returns number `5`.

**File:** `/App.tsx`

```typescript
const task5 = () => {
  console.log(giveMeFive, giveMeFive());
};
```

### Solution

**File:** `/shared/NativeJSIWorkshopsModule.cpp`

```cpp
void NativeJSIWorkshopsModule::task5(jsi::Runtime &rt) {
  const char *propertyName = "giveMeFive";
  auto functionBody = [](
    jsi::Runtime &rt,
    const jsi::Value &thisValue,
    const jsi::Value *args,
    size_t count
  ) -> jsi::Value {
    return jsi::Value(5);
  };
  jsi::Function func = jsi::Function::createFromHostFunction(
    rt,
    jsi::PropNameID::forAscii(rt, propertyName),
    0,
    functionBody
  );
  rt.global().setProperty(rt, propertyName, func);
}
```

---

## Task 6 ✍️

To JS Runtime global object inject function `sumMeThis` which takes two numbers as arguments and returns their sum.

**File:** `/App.tsx`

```typescript
const task6 = () => {
  console.log(sumMeThis(4, 5));
};
```

_(Solution collapsed in the deck.)_

---

## Task 7 👀

To JS Runtime global object inject function `divideMeThis` which takes two numbers as arguments and returns their result of the division. Try to throw JS exception if someone try to divide by 0.

**File:** `/App.tsx`

```typescript
const task7 = () => {
  console.log(divideMeThis(10, 5));
  try {
    divideMeThis(10, 0);
  } catch (e) {
    console.error(e);
  }
};
```

_(Solution collapsed in the deck.)_

---

## Task 8 👀

To JS Runtime global object inject function `reverseMeThis` which takes a string as argument and returns reverted string.

**File:** `/App.tsx`

```typescript
const task8 = () => {
  console.log(reverseMeThis("JSI workshops"));
};
```

**TIP:**

```cpp
std::reverse(string.begin(), string.end());
```

_(Solution collapsed in the deck.)_

---

## Task 9 👀

To JS Runtime global object inject function `sumMeThisObject` which takes object `{firstNum: number, lastNum: number}` as argument and returns object `{result: number}` contains in `result` property the sum of `firstNum` and `lastNum` properties.

**File:** `/App.tsx`

```typescript
const task9 = () => {
  console.log(sumMeThisObject({ firstNum: 4, lastNum: 5 }));
};
```

_(Solution collapsed in the deck.)_

---

## Task 10 👀

To JS Runtime global object inject function `sumMeThisArray` which takes an array of numbers as argument and returns the sum of numbers from the array.

**File:** `/App.tsx`

```typescript
const task10 = () => {
  console.log(sumMeThisArray([1, 2, 3, 4, 5]));
};
```

_(Solution collapsed in the deck.)_

---

## Task 11 ✍️

To JS Runtime global object inject function `nativeMap` which takes an array of numbers and function as arguments. Apply the received function on every element of the array and after that return array with mapped items. You can create a new one or use the received array for mapping.

**File:** `/App.tsx`

```typescript
const task11 = () => {
  const result = nativeMap([1, 2, 3, 4, 5], (x: number) => x * x);
  console.log(result);
};
```

_(Solution collapsed in the deck.)_

---

## Task 12 👀

To JS Runtime global object inject function `runJsFunction` which get access to `console.log` and call them on native side.

**File:** `/App.tsx`

```typescript
const task12 = () => {
  runJsFunction();
};
```

_(Solution collapsed in the deck.)_

---

## Task 13 ✍️

To JS Runtime global object inject function `getDateObject` which returns `HostObject` `Date`. The `Date` should support `now`, `day`, `month`, `year` property.

**File:** `/src/App.tsx`

```typescript
const task13 = () => {
  const date = getDateObject();
  console.log(date);
  console.log(date.day, date.month, date.year);
  console.log(date.now);
  console.log(date.hello);
  console.log("--------------------");
  date.day = 5;
  date.month = 12;
  date.year = 2025;
  console.log(date.day, date.month, date.year);
  console.log("--------------------");
};
```

**TIP:**

```cpp
time_t now = time(0);
std::string dateTime = ctime(&now);
```

```cpp
time_t rawtime;
time(&rawtime);
struct tm *timeinfo = localtime(&rawtime);
int year = timeinfo->tm_year + 1900;
int month = timeinfo->tm_mon;
int day = timeinfo->tm_mday;
```

_(Solution collapsed in the deck.)_

---

## Task 14 👀

To JS Runtime global object inject function `getDateObject` which returns HostObject `InfinityObject`. The `InfinityObject` should support any possible property and returns a current counter value. The counter should be increment on a reading of any property and decrement on writing to any property.

_(Slide text names `getDateObject`; the usage snippet below calls `getInfinityObject()`.)_

**File:** `/src/App.tsx`

```typescript
const task14 = () => {
  const infinityObject = getInfinityObject();
  console.log(infinityObject.a);
  console.log(infinityObject.wgwrw);
  console.log(infinityObject.jboqo345vj);
  infinityObject.x = 0;
  infinityObject.x = 0;
  console.log(infinityObject.ojbob);
};
```

_(Solution collapsed in the deck.)_

---

## Task 15 — Native State 👀

Add a native state to `simpleObject` that will contain a counter for how many times it has been sent to the `NativeJSIWorkshopsModule.task15` method.

**File:** `/src/App.tsx`

```typescript
const simpleObject = {};
const task15 = () => {
  NativeJSIWorkshopsModule.task15(simpleObject);
};
```

_(Solution collapsed in the deck.)_
