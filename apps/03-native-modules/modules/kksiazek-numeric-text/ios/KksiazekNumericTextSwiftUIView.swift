import ExpoModulesCore
import ExpoUI
import SwiftUI

struct KksiazekNumericTextSwiftUIView: ExpoSwiftUI.View {
  @ObservedObject var props: UIBaseViewProps

  @State private var count = 0
  @State private var countsDown = false

  var body: some View {
    VStack(spacing: 20) {
      NumericValueCard(value: NumericCounter.display(count), countsDown: countsDown)

      HStack(spacing: 28) {
        NumericControlButton(
          symbol: "−",
          accessibilityLabel: "Subtract random amount",
          isEnabled: count > NumericCounter.range.lowerBound
        ) {
          change(by: -NumericCounter.randomDelta())
        }

        NumericControlButton(symbol: "+", accessibilityLabel: "Add random amount") {
          change(by: NumericCounter.randomDelta())
        }
      }

      Children()
    }
    .frame(maxWidth: .infinity)
  }

  private func change(by delta: Int) {
    countsDown = delta < 0

    withAnimation {
      count = NumericCounter.applying(delta, to: count)
    }
  }
}
