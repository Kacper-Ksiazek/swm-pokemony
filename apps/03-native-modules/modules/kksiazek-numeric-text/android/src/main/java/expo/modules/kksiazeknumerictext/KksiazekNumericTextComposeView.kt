package expo.modules.kksiazeknumerictext

import androidx.compose.animation.AnimatedContent
import androidx.compose.animation.slideInVertically
import androidx.compose.animation.slideOutVertically
import androidx.compose.animation.togetherWith
import androidx.compose.foundation.background
import androidx.compose.foundation.clickable
import androidx.compose.foundation.interaction.MutableInteractionSource
import androidx.compose.foundation.interaction.collectIsPressedAsState
import androidx.compose.foundation.layout.Arrangement
import androidx.compose.foundation.layout.Box
import androidx.compose.foundation.layout.Column
import androidx.compose.foundation.layout.Row
import androidx.compose.foundation.layout.fillMaxWidth
import androidx.compose.foundation.layout.heightIn
import androidx.compose.foundation.layout.size
import androidx.compose.foundation.shape.CircleShape
import androidx.compose.foundation.shape.RoundedCornerShape
import androidx.compose.material3.Text
import androidx.compose.runtime.Composable
import androidx.compose.runtime.getValue
import androidx.compose.runtime.mutableIntStateOf
import androidx.compose.runtime.mutableStateOf
import androidx.compose.runtime.remember
import androidx.compose.runtime.setValue
import androidx.compose.ui.Alignment
import androidx.compose.ui.Modifier
import androidx.compose.ui.draw.alpha
import androidx.compose.ui.draw.clip
import androidx.compose.ui.draw.scale
import androidx.compose.ui.geometry.Offset
import androidx.compose.ui.graphics.Brush
import androidx.compose.ui.semantics.contentDescription
import androidx.compose.ui.semantics.semantics
import androidx.compose.ui.text.TextStyle
import androidx.compose.ui.text.font.FontWeight
import androidx.compose.ui.unit.dp
import androidx.compose.ui.unit.sp
import expo.modules.kotlin.records.Field
import expo.modules.kotlin.views.ComposeProps
import expo.modules.kotlin.views.FunctionalComposableScope
import expo.modules.ui.ModifierList
import expo.modules.ui.ModifierRegistry

data class KksiazekNumericTextComposeViewProps(
    @Field val title: String = "",
    @Field val modifiers: ModifierList = emptyList(),
) : ComposeProps

@Composable
fun FunctionalComposableScope.kksiazekNumericTextComposeViewContent(
    props: KksiazekNumericTextComposeViewProps,
) {
    var count by remember { mutableIntStateOf(0) }
    var countsDown by remember { mutableStateOf(false) }

    fun change(by: Int) {
        countsDown = by < 0
        count = NumericCounter.applying(by, count)
    }

    val outerModifier =
        ModifierRegistry.applyModifiers(
            props.modifiers,
            appContext,
            composableScope,
            globalEventDispatcher,
        )

    Column(
        modifier = outerModifier.fillMaxWidth(),
        horizontalAlignment = Alignment.CenterHorizontally,
        verticalArrangement = Arrangement.spacedBy(20.dp),
    ) {
        numericValueCard(
            value = NumericCounter.display(count),
            countsDown = countsDown,
        )

        Row(horizontalArrangement = Arrangement.spacedBy(28.dp)) {
            numericControlButton(
                symbol = "−",
                contentDescription = "Subtract random amount",
                enabled = count > NumericCounter.MIN,
            ) {
                change(by = -NumericCounter.randomDelta())
            }
            numericControlButton(
                symbol = "+",
                contentDescription = "Add random amount",
                enabled = true,
            ) {
                change(by = NumericCounter.randomDelta())
            }
        }

        Children(composableScope)
    }
}

@Composable
private fun numericValueCard(
    value: String,
    countsDown: Boolean,
) {
    Box(
        modifier =
            Modifier
                .fillMaxWidth()
                .heightIn(min = 200.dp)
                .clip(RoundedCornerShape(16.dp))
                .background(
                    brush =
                        Brush.linearGradient(
                            colors =
                                listOf(
                                    NumericPalette.cardGradientStart,
                                    NumericPalette.cardGradientMid,
                                    NumericPalette.cardGradientEnd,
                                ),
                            start = Offset(0f, 0f),
                            end = Offset(1000f, 1000f),
                        ),
                ).semantics { contentDescription = value },
        contentAlignment = Alignment.Center,
    ) {
        AnimatedContent(
            targetState = value,
            transitionSpec = {
                if (countsDown) {
                    slideInVertically { height -> height } togetherWith
                        slideOutVertically { height -> -height }
                } else {
                    slideInVertically { height -> -height } togetherWith
                        slideOutVertically { height -> height }
                }
            },
            label = "numericValue",
        ) { display ->
            Text(
                text = display,
                style =
                    TextStyle(
                        fontSize = 88.sp,
                        fontWeight = FontWeight.Bold,
                        letterSpacing = 2.sp,
                        fontFeatureSettings = "tnum",
                        color = NumericPalette.valueOnCard,
                    ),
            )
        }
    }
}

@Composable
private fun numericControlButton(
    symbol: String,
    contentDescription: String,
    enabled: Boolean,
    onClick: () -> Unit,
) {
    val interactionSource = remember { MutableInteractionSource() }
    val pressed by interactionSource.collectIsPressedAsState()
    val scale = if (pressed) 0.96f else 1f
    val alpha =
        when {
            !enabled -> 0.35f
            pressed -> 0.75f
            else -> 1f
        }

    Box(
        modifier =
            Modifier
                .size(56.dp)
                .scale(scale)
                .alpha(alpha)
                .clip(CircleShape)
                .background(NumericPalette.buttonBackground)
                .clickable(
                    interactionSource = interactionSource,
                    indication = null,
                    enabled = enabled,
                    onClick = onClick,
                ).semantics { this.contentDescription = contentDescription },
        contentAlignment = Alignment.Center,
    ) {
        Text(
            text = symbol,
            fontSize = 28.sp,
            fontWeight = FontWeight.Medium,
            color = NumericPalette.buttonForeground,
            lineHeight = 32.sp,
        )
    }
}
