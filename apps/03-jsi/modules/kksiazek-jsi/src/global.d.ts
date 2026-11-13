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
}

export {};
