import ExpoModulesCore
import WebKit

final class KksiazekWebView: ExpoView, WKNavigationDelegate {
  let webView = WKWebView()
  let onLoad = EventDispatcher()

  private var requestedURL: URL?

  required init(appContext: AppContext? = nil) {
    super.init(appContext: appContext)

    clipsToBounds = true
    webView.navigationDelegate = self

    addSubview(webView)
  }

  override func layoutSubviews() {
    webView.frame = bounds
  }

  func load(url: URL) {
    guard requestedURL != url else {
      return
    }

    requestedURL = url
    webView.load(URLRequest(url: url))
  }

  func webView(_ webView: WKWebView, didFinish _: WKNavigation!) {
    guard let url = webView.url else {
      return
    }

    onLoad(["url": url.absoluteString])
  }
}
