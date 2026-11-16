declare global {
  var __kksiazekJsiReady: boolean;

  var answerToTheUltimateQuestionOfLifeTheUniverseAndEverything: number;
  var isWednesday: boolean;
  var workshopName: string;
  var myAwesomeArray: [number, boolean, string];

  // Counter module
  var counter: number;
  var increment: () => void;
  var decrement: () => void;

  // Calculator module
  var calculate: (args: number[], operation: "add" | "subtract" | "multiply") => number;

  // String operations module
  var transformString: (
    str: string,
    operation: "uppercase" | "lowercase" | "reverse" | "capitalize" | "shuffle" | "blur",
  ) => string;

  // Array map module
  var nativeMap: (array: number[], callback: (x: number) => number) => number[];

  // Date HostObject module
  interface JsiDateHostObject {
    readonly now: string;
    day: number;
    month: number;
    year: number;
  }

  var getDateObject: () => JsiDateHostObject;

  // Infinity HostObject module
  type JsiInfinityHostObject = Record<string, number>;

  var getInfinityObject: () => JsiInfinityHostObject;
  var peekInfinityCounter: (obj: JsiInfinityHostObject) => number;

  // Object arguments module
  var sumMeThisObject: (input: { firstNum: number; lastNum: number }) => {
    result: number;
  };

  // NativeState module
  var trackNativeState: (obj: Record<string, unknown>) => number;

  // Divide module
  var divideMeThis: (a: number, b: number) => number;
}

export {};
