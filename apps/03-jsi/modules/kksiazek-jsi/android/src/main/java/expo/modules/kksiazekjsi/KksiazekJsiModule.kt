package expo.modules.kksiazekjsi

import com.facebook.proguard.annotations.DoNotStrip
import com.facebook.react.bridge.ReactApplicationContext
import com.facebook.react.bridge.ReactContextBaseJavaModule
import com.facebook.react.turbomodule.core.interfaces.BindingsInstallerHolder
import com.facebook.react.turbomodule.core.interfaces.TurboModule
import com.facebook.react.turbomodule.core.interfaces.TurboModuleWithJSIBindings
import com.facebook.soloader.SoLoader

@DoNotStrip
class KksiazekJsiModule(
    reactContext: ReactApplicationContext,
) : ReactContextBaseJavaModule(reactContext),
    TurboModule,
    TurboModuleWithJSIBindings {
    override fun getName(): String = NAME

    @DoNotStrip external override fun getBindingsInstaller(): BindingsInstallerHolder

    companion object {
        const val NAME: String = "KksiazekJsi"

        init {
            SoLoader.loadLibrary("kksiazekjsi")
        }
    }
}
