import SwiftUI

struct PressableButtonStyle: ButtonStyle {
  @Environment(\.isEnabled) private var isEnabled

  func makeBody(configuration: Configuration) -> some View {
    configuration.label
      .scaleEffect(configuration.isPressed ? 0.96 : 1)
      .opacity(opacity(isPressed: configuration.isPressed))
      .animation(.easeOut(duration: 0.12), value: configuration.isPressed)
      .animation(.easeOut(duration: 0.12), value: isEnabled)
  }

  private func opacity(isPressed: Bool) -> Double {
    guard isEnabled else { return 0.35 }

    return isPressed ? 0.75 : 1
  }
}
