package expo.modules.kksiazeksystemtheme

import android.content.ComponentCallbacks
import android.content.Context
import android.content.res.Configuration
import expo.modules.kotlin.modules.Module
import expo.modules.kotlin.modules.ModuleDefinition

private const val COLOR_SCHEME_CHANGE_EVENT_NAME = "onColorSchemeChange"

class KksiazekSystemThemeModule : Module() {
    private var configurationCallback: ComponentCallbacks? = null
    private var lastEmittedScheme: String? = null

    override fun definition() =
        ModuleDefinition {
            Name("KksiazekSystemTheme")

            Events(COLOR_SCHEME_CHANGE_EVENT_NAME)

            OnStartObserving(COLOR_SCHEME_CHANGE_EVENT_NAME) {
                startObserving()
            }

            OnStopObserving(COLOR_SCHEME_CHANGE_EVENT_NAME) {
                stopObserving()
            }

            OnDestroy {
                stopObserving()
            }

            Function("getColorScheme") {
                currentColorScheme()
            }
        }

    private fun applicationContext(): Context? = appContext.reactContext?.applicationContext

    private fun currentColorScheme(): String {
        val context = appContext.reactContext ?: applicationContext() ?: return "light"

        return stringify(context.resources.configuration)
    }

    // Matches iOS: only "dark" when night mode is explicitly on; otherwise "light".
    private fun stringify(configuration: Configuration): String =
        when (configuration.uiMode and Configuration.UI_MODE_NIGHT_MASK) {
            Configuration.UI_MODE_NIGHT_YES -> "dark"
            else -> "light"
        }

    private fun startObserving() {
        if (configurationCallback != null) {
            return
        }

        val context = applicationContext() ?: return

        lastEmittedScheme = currentColorScheme()

        val callback =
            object : ComponentCallbacks {
                override fun onConfigurationChanged(newConfig: Configuration) {
                    val scheme = stringify(newConfig)
                    if (scheme == lastEmittedScheme) {
                        return
                    }

                    lastEmittedScheme = scheme
                    sendEvent(
                        COLOR_SCHEME_CHANGE_EVENT_NAME,
                        mapOf("colorScheme" to scheme),
                    )
                }

                override fun onLowMemory() {}
            }

        configurationCallback = callback
        context.registerComponentCallbacks(callback)
    }

    private fun stopObserving() {
        val callback = configurationCallback ?: return

        applicationContext()?.unregisterComponentCallbacks(callback)
        configurationCallback = null
        lastEmittedScheme = null
    }
}
