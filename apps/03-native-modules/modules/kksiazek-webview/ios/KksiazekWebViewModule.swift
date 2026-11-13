import ExpoModulesCore

public class KksiazekWebViewModule: Module {
  public func definition() -> ModuleDefinition {
    Name("KksiazekWebView")

    View(KksiazekWebView.self) {
      Events("onLoad")

      Prop("url") { (view: KksiazekWebView, url: URL?) in
        guard let url else {
          return
        }

        view.load(url: url)
      }
    }
  }
}
