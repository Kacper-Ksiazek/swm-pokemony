import ExpoModulesCore
import ExpoUI

public class KksiazekNumericTextModule: Module {
  public func definition() -> ModuleDefinition {
    Name("KksiazekNumericText")

    ExpoUIView(KksiazekNumericTextSwiftUIView.self)
  }
}
