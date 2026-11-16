package expo.modules.kksiazeknumerictext

import expo.modules.kotlin.modules.Module
import expo.modules.kotlin.modules.ModuleDefinition
import expo.modules.ui.ExpoUIView

class KksiazekNumericTextModule : Module() {
    override fun definition() =
        ModuleDefinition {
            Name("KksiazekNumericText")

            ExpoUIView<KksiazekNumericTextComposeViewProps>("KksiazekNumericTextComposeView") {
                Content { props ->
                    kksiazekNumericTextComposeViewContent(props)
                }
            }
        }
}
