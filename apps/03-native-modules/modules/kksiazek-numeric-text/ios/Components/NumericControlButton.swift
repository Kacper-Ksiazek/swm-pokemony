import SwiftUI

struct NumericControlButton: View {
  let symbol: String
  let accessibilityLabel: String
  var isEnabled = true
  let action: () -> Void

  @ScaledMetric(relativeTo: .title) private var size: CGFloat = 56

  var body: some View {
    Button(action: action) {
      Text(symbol)
        .font(.system(size: size * 0.5, weight: .medium))
        .foregroundStyle(NumericPalette.buttonForeground)
        .frame(width: size, height: size)
        .background(NumericPalette.buttonBackground, in: Circle())
    }
    .buttonStyle(PressableButtonStyle())
    .disabled(!isEnabled)
    .accessibilityLabel(accessibilityLabel)
  }
}
