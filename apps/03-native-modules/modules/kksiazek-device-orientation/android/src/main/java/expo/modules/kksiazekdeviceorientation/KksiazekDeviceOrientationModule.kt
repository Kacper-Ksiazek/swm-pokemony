package expo.modules.kksiazekdeviceorientation

import android.app.Activity
import android.content.ComponentCallbacks
import android.content.Context
import android.content.res.Configuration
import android.hardware.display.DisplayManager
import android.os.Build
import android.os.Handler
import android.os.Looper
import android.util.DisplayMetrics
import android.view.Display
import android.view.Surface
import android.view.WindowInsets
import expo.modules.kotlin.modules.Module
import expo.modules.kotlin.modules.ModuleDefinition

private const val ORIENTATION_CHANGE_EVENT_NAME = "onOrientationChange"

class KksiazekDeviceOrientationModule : Module() {
    private var configurationCallback: ComponentCallbacks? = null
    private var displayListener: DisplayManager.DisplayListener? = null
    private var lastEmittedOrientation: String? = null

    override fun definition() =
        ModuleDefinition {
            Name("KksiazekDeviceOrientation")

            Events(ORIENTATION_CHANGE_EVENT_NAME)

            OnStartObserving(ORIENTATION_CHANGE_EVENT_NAME) {
                startObserving()
            }

            OnStopObserving(ORIENTATION_CHANGE_EVENT_NAME) {
                stopObserving()
            }

            OnDestroy {
                stopObserving()
            }

            AsyncFunction("getOrientationAsync") {
                currentOrientationString()
            }
        }

    private fun applicationContext(): Context? = appContext.reactContext?.applicationContext

    private fun currentOrientationString(): String {
        val activity = appContext.currentActivity ?: return "UNKNOWN"
        return screenOrientationString(activity)
    }

    // Same best-effort mapping as expo-screen-orientation (interface orientation, not raw surface).
    private fun screenOrientationString(activity: Activity): String {
        val windowManager = activity.windowManager ?: return "UNKNOWN"

        val rotation =
            if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.R) {
                activity.window.context.display
                    ?.rotation ?: return "UNKNOWN"
            } else {
                @Suppress("DEPRECATION")
                windowManager.defaultDisplay.rotation
            }

        val displayMetrics =
            if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.R) {
                val windowMetrics = windowManager.currentWindowMetrics
                val insets =
                    windowMetrics.windowInsets.getInsetsIgnoringVisibility(
                        WindowInsets.Type.systemBars(),
                    )
                DisplayMetrics().apply {
                    widthPixels = windowMetrics.bounds.width() - insets.left - insets.right
                    heightPixels = windowMetrics.bounds.height() - insets.top - insets.bottom
                }
            } else {
                @Suppress("DEPRECATION")
                DisplayMetrics().also(windowManager.defaultDisplay::getMetrics)
            }

        val portraitNatural =
            isPortraitNaturalOrientation(
                rotation,
                displayMetrics.widthPixels,
                displayMetrics.heightPixels,
            )

        return if (portraitNatural) {
            when (rotation) {
                Surface.ROTATION_0 -> "PORTRAIT_UP"
                Surface.ROTATION_90 -> "LANDSCAPE_RIGHT"
                Surface.ROTATION_180 -> "PORTRAIT_DOWN"
                Surface.ROTATION_270 -> "LANDSCAPE_LEFT"
                else -> "UNKNOWN"
            }
        } else {
            when (rotation) {
                Surface.ROTATION_0 -> "LANDSCAPE_RIGHT"
                Surface.ROTATION_90 -> "PORTRAIT_DOWN"
                Surface.ROTATION_180 -> "LANDSCAPE_LEFT"
                Surface.ROTATION_270 -> "PORTRAIT_UP"
                else -> "UNKNOWN"
            }
        }
    }

    private fun isPortraitNaturalOrientation(
        rotation: Int,
        width: Int,
        height: Int,
    ) = (
        (rotation == Surface.ROTATION_0 || rotation == Surface.ROTATION_180) &&
            height > width
    ) ||
        (
            (rotation == Surface.ROTATION_90 || rotation == Surface.ROTATION_270) &&
                width > height
        )

    private fun startObserving() {
        if (configurationCallback != null) {
            return
        }

        val context = applicationContext() ?: return

        lastEmittedOrientation = currentOrientationString()

        val callback =
            object : ComponentCallbacks {
                override fun onConfigurationChanged(newConfig: Configuration) {
                    emitOrientationIfChanged()
                }

                override fun onLowMemory() {}
            }

        configurationCallback = callback
        context.registerComponentCallbacks(callback)

        val displayManager = context.getSystemService(Context.DISPLAY_SERVICE) as DisplayManager
        val listener =
            object : DisplayManager.DisplayListener {
                override fun onDisplayAdded(displayId: Int) {}

                override fun onDisplayRemoved(displayId: Int) {}

                override fun onDisplayChanged(displayId: Int) {
                    if (displayId != Display.DEFAULT_DISPLAY) {
                        return
                    }
                    emitOrientationIfChanged()
                }
            }
        displayListener = listener
        displayManager.registerDisplayListener(listener, Handler(Looper.getMainLooper()))
    }

    private fun emitOrientationIfChanged() {
        val orientation = currentOrientationString()
        if (orientation == lastEmittedOrientation) {
            return
        }

        lastEmittedOrientation = orientation
        sendEvent(
            ORIENTATION_CHANGE_EVENT_NAME,
            mapOf("orientation" to orientation),
        )
    }

    private fun stopObserving() {
        val context = applicationContext()

        configurationCallback?.let { callback ->
            context?.unregisterComponentCallbacks(callback)
        }
        configurationCallback = null

        displayListener?.let { listener ->
            (
                context?.getSystemService(Context.DISPLAY_SERVICE) as? DisplayManager
            )?.unregisterDisplayListener(listener)
        }
        displayListener = null
        lastEmittedOrientation = null
    }
}
