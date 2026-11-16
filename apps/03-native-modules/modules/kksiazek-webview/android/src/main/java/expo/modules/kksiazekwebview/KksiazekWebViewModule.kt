package expo.modules.kksiazekwebview

import expo.modules.kotlin.modules.Module
import expo.modules.kotlin.modules.ModuleDefinition
import java.net.URL

class KksiazekWebViewModule : Module() {
    override fun definition() =
        ModuleDefinition {
            Name("KksiazekWebView")

            View(KksiazekWebView::class) {
                Events("onLoad")

                Prop("url") { view: KksiazekWebView, url: URL? ->
                    view.load(url)
                }
            }
        }
}
