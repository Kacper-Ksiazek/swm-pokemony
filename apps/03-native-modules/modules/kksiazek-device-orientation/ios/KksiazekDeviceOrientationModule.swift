import ExpoModulesCore
import UIKit

private let orientationChangeEventName = "onOrientationChange"

public class KksiazekDeviceOrientationModule: Module {
  private var isObservingDeviceOrientation = false

  public func definition() -> ModuleDefinition {
    Name("KksiazekDeviceOrientation")

    Events(orientationChangeEventName)

    OnCreate {
      UIDevice.current.beginGeneratingDeviceOrientationNotifications()
    }

    OnDestroy {
      self.stopObservingDeviceOrientationIfNeeded()
      UIDevice.current.endGeneratingDeviceOrientationNotifications()
    }

    OnStartObserving(orientationChangeEventName) {
      self.startObservingDeviceOrientation()
    }

    OnStopObserving(orientationChangeEventName) {
      self.stopObservingDeviceOrientationIfNeeded()
    }

    // Device orientation (fizyczny obrót) ≠ interface orientation (np. gdy app.json blokuje obrót
    // UI).
    AsyncFunction("getOrientationAsync") { () -> String in
      Self.stringify(deviceOrientation: UIDevice.current.orientation)
    }
  }

  private func startObservingDeviceOrientation() {
    guard !isObservingDeviceOrientation else { return }
    isObservingDeviceOrientation = true

    NotificationCenter.default.addObserver(
      self,
      selector: #selector(handleDeviceOrientationDidChange),
      name: UIDevice.orientationDidChangeNotification,
      object: nil
    )
  }

  private func stopObservingDeviceOrientationIfNeeded() {
    guard isObservingDeviceOrientation else { return }
    isObservingDeviceOrientation = false

    NotificationCenter.default.removeObserver(
      self,
      name: UIDevice.orientationDidChangeNotification,
      object: nil
    )
  }

  @objc
  private func handleDeviceOrientationDidChange() {
    let orientation = Self.stringify(deviceOrientation: UIDevice.current.orientation)

    sendEvent(orientationChangeEventName, [
      "orientation": orientation
    ])
  }

  /// Mapowanie 1:1 `UIDeviceOrientation` → kontrakt JS (jak w turbo-modules-orientation-todo).
  /// UIKit: `landscapeLeft` = urządzenie obrócone tak, że **górna krawędź** jest po lewej stronie
  /// ekranu;
  /// to bywa mylące względem etykiet w `expo-screen-orientation` — porównaj na Task 1.
  private static func stringify(deviceOrientation: UIDeviceOrientation) -> String {
    switch deviceOrientation {
    case .portrait:
      "PORTRAIT_UP"
    case .portraitUpsideDown:
      "PORTRAIT_DOWN"
    case .landscapeLeft:
      "LANDSCAPE_LEFT"
    case .landscapeRight:
      "LANDSCAPE_RIGHT"
    case .faceUp, .faceDown, .unknown:
      "UNKNOWN"
    @unknown default:
      "UNKNOWN"
    }
  }
}
