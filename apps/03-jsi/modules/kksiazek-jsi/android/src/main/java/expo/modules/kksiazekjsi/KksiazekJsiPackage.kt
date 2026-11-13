package expo.modules.kksiazekjsi

import com.facebook.react.BaseReactPackage
import com.facebook.react.bridge.NativeModule
import com.facebook.react.bridge.ReactApplicationContext
import com.facebook.react.module.model.ReactModuleInfo
import com.facebook.react.module.model.ReactModuleInfoProvider

class KksiazekJsiPackage : BaseReactPackage() {
    override fun getModule(
        name: String,
        reactContext: ReactApplicationContext,
    ): NativeModule? {
        if (name == KksiazekJsiModule.NAME) {
            return KksiazekJsiModule(reactContext)
        }
        return null
    }

    override fun getReactModuleInfoProvider(): ReactModuleInfoProvider =
        ReactModuleInfoProvider {
            mapOf(
                KksiazekJsiModule.NAME to
                    ReactModuleInfo(
                        KksiazekJsiModule.NAME,
                        KksiazekJsiModule::class.java.name,
                        false,
                        false,
                        false,
                        true,
                    ),
            )
        }
}
