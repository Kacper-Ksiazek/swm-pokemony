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

    AsyncFunction("getOrientationAsync") { () -> String in
      Self.stringify(
        interfaceOrientation: Self.interfaceOrientation(from: UIDevice.current.orientation)
      )
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
    let orientation = Self.stringify(
      interfaceOrientation: Self.interfaceOrientation(from: UIDevice.current.orientation)
    )

    sendEvent(orientationChangeEventName, [
      "orientation": orientation
    ])
  }

  /// Jak `UIDeviceOrientation.toInterfaceOrientation()` w `expo-screen-orientation` — landscape L/R
  /// w `UIDevice` jest zamienione względem orientacji interfejsu.
  private static func interfaceOrientation(from deviceOrientation: UIDeviceOrientation)
    -> UIInterfaceOrientation
  {
    switch deviceOrientation {
    case .portrait:
      .portrait
    case .portraitUpsideDown:
      .portraitUpsideDown
    case .landscapeLeft:
      .landscapeRight
    case .landscapeRight:
      .landscapeLeft
    default:
      .unknown
    }
  }

  /// Kontrakt JS = `Orientation` z `expo-screen-orientation` (interface, nie raw `UIDevice`).
  private static func stringify(interfaceOrientation: UIInterfaceOrientation) -> String {
    switch interfaceOrientation {
    case .portrait:
      "PORTRAIT_UP"
    case .portraitUpsideDown:
      "PORTRAIT_DOWN"
    case .landscapeLeft:
      "LANDSCAPE_LEFT"
    case .landscapeRight:
      "LANDSCAPE_RIGHT"
    case .unknown:
      "UNKNOWN"
    @unknown default:
      "UNKNOWN"
    }
  }
}
