enum NumericCounter {
  static let range = 0 ... 999
  static let deltaRange = 0 ... 25

  static func applying(_ delta: Int, to value: Int) -> Int {
    min(range.upperBound, max(range.lowerBound, value + delta))
  }

  static func randomDelta() -> Int {
    Int.random(in: deltaRange)
  }

  static func display(_ value: Int) -> String {
    let digits = String(value)

    return String(repeating: "0", count: max(0, 3 - digits.count)) + digits
  }
}
