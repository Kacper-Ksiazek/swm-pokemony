package expo.modules.kksiazeksystemtheme

import expo.modules.kotlin.modules.Module
import expo.modules.kotlin.modules.ModuleDefinition

class KksiazekSystemThemeModule : Module() {
    override fun definition() =
        ModuleDefinition {
            Name("KksiazekSystemTheme")

            Events("onColorSchemeChange")

            Function("getColorScheme") {
                "light"
            }
        }
}
