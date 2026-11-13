/// <reference path="./global.d.ts" />

import { Platform, TurboModuleRegistry, type TurboModule } from "react-native";

const MODULE_NAME = "KksiazekJsi";

// Requiring the turbo module is what runs the C++ installer on the JS thread.
export function setupJsiBindings(): void {
  if (Platform.OS === "web") {
    throw new Error("JSI bindings are set up on iOS and Android only.");
  }

  TurboModuleRegistry.getEnforcing<TurboModule>(MODULE_NAME);
}
