require "json"

package = JSON.parse(File.read(File.join(__dir__, "package.json")))

Pod::Spec.new do |s|
  s.name           = "kksiazek-jsi"
  s.version        = package["version"]
  s.summary        = package["description"]
  s.description    = "C++ JSI installer shared with the Android library."
  s.homepage       = "https://github.com/facebook/react-native"
  s.license        = { :type => "MIT" }
  s.author         = ""
  s.platforms      = { :ios => "17.0" }
  s.source         = { :git => "" }
  s.static_framework = true

  s.source_files = "ios/**/*.{h,m,mm}", "cpp/**/*.{hpp,cpp}"

  s.pod_target_xcconfig = {
    "HEADER_SEARCH_PATHS" => "\"$(PODS_TARGET_SRCROOT)/cpp\"",
    "CLANG_CXX_LANGUAGE_STANDARD" => "c++20",
    "DEFINES_MODULE" => "YES"
  }

  install_modules_dependencies(s)
end
