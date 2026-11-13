import ExpoModulesCore
import UIKit

private let colorSchemeChangeEventName = "onColorSchemeChange"

public class KksiazekSystemThemeModule: Module {
  private var traitRegistration: (any UITraitChangeRegistration)?
  private weak var observedScene: UIWindowScene?

  public func definition() -> ModuleDefinition {
    Name("KksiazekSystemTheme")

    Events(colorSchemeChangeEventName)

    OnStartObserving(colorSchemeChangeEventName) {
      Task { @MainActor in
        self.startObserving()
      }
    }

    OnStopObserving(colorSchemeChangeEventName) {
      Task { @MainActor in
        self.stopObserving()
      }
    }

    OnDestroy {
      Task { @MainActor in
        self.stopObserving()
      }
    }

    Function("getColorScheme") { () -> String in
      DispatchQueue.main.sync { Self.currentColorScheme() }
    }
  }

  @MainActor
  private func startObserving() {
    guard traitRegistration == nil, let scene = Self.windowScene() else { return }

    observedScene = scene

    traitRegistration = scene.registerForTraitChanges([UITraitUserInterfaceStyle.self]) {
      (scene: UIWindowScene, _) in
      self.sendEvent(colorSchemeChangeEventName, [
        "colorScheme": Self.stringify(scene.traitCollection.userInterfaceStyle)
      ])
    }
  }

  @MainActor
  private func stopObserving() {
    if let registration = traitRegistration {
      observedScene?.unregisterForTraitChanges(registration)
    }

    traitRegistration = nil
    observedScene = nil
  }

  private static func windowScene() -> UIWindowScene? {
    UIApplication.shared.connectedScenes.compactMap { $0 as? UIWindowScene }.first
  }

  private static func currentColorScheme() -> String {
    stringify(windowScene()?.traitCollection.userInterfaceStyle ?? .unspecified)
  }

  /// `.unspecified` → `"light"`, tak jak `useColorScheme` w RN.
  private static func stringify(_ style: UIUserInterfaceStyle) -> String {
    style == .dark ? "dark" : "light"
  }
}
