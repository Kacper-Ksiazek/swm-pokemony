Pod::Spec.new do |s|
  s.name           = 'KksiazekWebView'
  s.version        = '1.0.0'
  s.summary        = 'Native WebView view (WKWebView)'
  s.description    = 'Expo module that renders a URL in WKWebView'
  s.author         = ''
  s.homepage       = 'https://docs.expo.dev/modules/'
  s.platforms      = {
    :ios => '17.0',
    :tvos => '17.0'
  }
  s.source         = { git: '' }
  s.static_framework = true

  s.dependency 'ExpoModulesCore'
  s.frameworks = 'WebKit'

  s.pod_target_xcconfig = {
    'DEFINES_MODULE' => 'YES',
  }

  s.source_files = "**/*.{h,m,mm,swift,hpp,cpp}"
end
