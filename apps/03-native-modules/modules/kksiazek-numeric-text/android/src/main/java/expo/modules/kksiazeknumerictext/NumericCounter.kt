package expo.modules.kksiazeknumerictext

import kotlin.random.Random

object NumericCounter {
    const val MIN = 0
    const val MAX = 999
    private const val DELTA_MIN = 0
    private const val DELTA_MAX = 25

    fun applying(
        delta: Int,
        value: Int,
    ): Int = (value + delta).coerceIn(MIN, MAX)

    fun randomDelta(): Int = Random.nextInt(DELTA_MIN, DELTA_MAX + 1)

    fun display(value: Int): String {
        val digits = value.toString()
        val padding = (3 - digits.length).coerceAtLeast(0)
        return "0".repeat(padding) + digits
    }
}
