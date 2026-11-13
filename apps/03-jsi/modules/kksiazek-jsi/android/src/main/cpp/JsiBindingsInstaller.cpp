#include <ReactCommon/BindingsInstallerHolder.h>
#include <fbjni/fbjni.h>
#include <jsi/jsi.h>

#include "JsiInstaller.hpp"

namespace jni = facebook::jni;

namespace kksiazek::jsi {

class JsiModuleBindings : public jni::JavaClass<JsiModuleBindings> {
public:
  static constexpr auto kJavaDescriptor =
      "Lexpo/modules/kksiazekjsi/KksiazekJsiModule;";

  static void registerNatives() {
    javaClassStatic()->registerNatives({
        makeNativeMethod("getBindingsInstaller",
                         JsiModuleBindings::getBindingsInstaller),
    });
  }

private:
  static jni::local_ref<facebook::react::BindingsInstallerHolder::javaobject>
  getBindingsInstaller(jni::alias_ref<JsiModuleBindings>) {
    return facebook::react::BindingsInstallerHolder::newObjectCxxArgs(
        [](facebook::jsi::Runtime &runtime,
           const std::shared_ptr<facebook::react::CallInvoker> &) {
          main(runtime);
        });
  }
};

} // namespace kksiazek::jsi

JNIEXPORT jint JNICALL JNI_OnLoad(JavaVM *vm, void *) {
  return jni::initialize(
      vm, [] { kksiazek::jsi::JsiModuleBindings::registerNatives(); });
}
