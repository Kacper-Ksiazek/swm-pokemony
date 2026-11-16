import SwiftUI

struct NumericValueCard: View {
  let value: String
  let countsDown: Bool

  @ScaledMetric(relativeTo: .largeTitle) private var fontSize: CGFloat = 88

  var body: some View {
    Text(value)
      .font(.system(size: fontSize, weight: .bold))
      .monospacedDigit()
      .tracking(2)
      .foregroundStyle(.white.opacity(0.92))
      .contentTransition(.numericText(countsDown: countsDown))
      .frame(maxWidth: .infinity, minHeight: 200)
      .background(
        RoundedRectangle(cornerRadius: 16, style: .continuous)
          .fill(NumericPalette.cardGradient)
      )
      .accessibilityLabel(value)
  }
}
