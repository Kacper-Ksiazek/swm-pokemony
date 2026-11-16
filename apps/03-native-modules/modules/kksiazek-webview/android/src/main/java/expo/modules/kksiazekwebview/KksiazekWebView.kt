package expo.modules.kksiazekwebview

import android.content.Context
import android.webkit.WebView
import android.webkit.WebViewClient
import expo.modules.kotlin.AppContext
import expo.modules.kotlin.viewevent.EventDispatcher
import expo.modules.kotlin.views.ExpoView
import java.net.URL

class KksiazekWebView(
    context: Context,
    appContext: AppContext,
) : ExpoView(context, appContext) {
    private val onLoad by EventDispatcher()
    private var requestedUrl: String? = null

    internal val webView =
        WebView(context).also {
            it.layoutParams = LayoutParams(LayoutParams.MATCH_PARENT, LayoutParams.MATCH_PARENT)
            // Android WebView ships with JavaScript off. WKWebView does not.
            it.settings.javaScriptEnabled = true
            it.webViewClient =
                object : WebViewClient() {
                    override fun onPageFinished(
                        view: WebView,
                        url: String,
                    ) {
                        onLoad(mapOf("url" to url))
                    }
                }
            addView(it)
        }

    fun load(url: URL?) {
        val next = url?.toString() ?: return
        if (next == requestedUrl) {
            return
        }

        requestedUrl = next
        webView.loadUrl(next)
    }
}
