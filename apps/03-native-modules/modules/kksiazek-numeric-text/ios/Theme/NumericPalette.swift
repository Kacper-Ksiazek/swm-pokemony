import SwiftUI

enum NumericPalette {
  static let cardGradient = LinearGradient(
    stops: [
      .init(color: Color(red: 0.482, green: 0.380, blue: 0.847), location: 0),
      .init(color: Color(red: 0.310, green: 0.561, blue: 0.910), location: 0.55),
      .init(color: Color(red: 0.357, green: 0.639, blue: 0.961), location: 1)
    ],
    startPoint: .topLeading,
    endPoint: .bottomTrailing
  )

  static let buttonForeground = Color(red: 0.227, green: 0.227, blue: 0.235)
  static let buttonBackground = Color(red: 0.922, green: 0.922, blue: 0.937)
}
