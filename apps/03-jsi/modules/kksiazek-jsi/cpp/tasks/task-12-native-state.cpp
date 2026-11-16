#include <jsi/jsi.h>
#include <memory>

#include "tasks/tasks.hpp"

namespace kksiazek::jsi {

using namespace facebook::jsi;

class CounterNativeState : public jsi::NativeState {
public:
  int count = 0;
};

void task12(facebook::jsi::Runtime &runtime) {
  const char *trackNativeStatePropertyName = "trackNativeState";

  auto trackNativeState = [](jsi::Runtime &runtime,
                             const jsi::Value &thisValue,
                             const jsi::Value *args,
                             size_t count) -> jsi::Value {
    if (count < 1 || !args[0].isObject() ||
        args[0].asObject(runtime).isArray(runtime) ||
        args[0].asObject(runtime).isFunction(runtime)) {
      throw jsi::JSError(
          runtime,
          "trackNativeState() requires a plain JS object as its argument"
      );
    }

    jsi::Object obj = args[0].asObject(runtime);

    if (obj.hasNativeState<CounterNativeState>(runtime)) {
      auto state = obj.getNativeState<CounterNativeState>(runtime);
      state->count += 1;
      return jsi::Value(state->count);
    }

    auto state = std::make_shared<CounterNativeState>();
    state->count = 1;
    obj.setNativeState(runtime, state);
    return jsi::Value(state->count);
  };

  runtime.global().setProperty(
      runtime,
      trackNativeStatePropertyName,
      jsi::Function::createFromHostFunction(
          runtime,
          jsi::PropNameID::forAscii(runtime, trackNativeStatePropertyName),
          1,
          trackNativeState
      )
  );
}

} // namespace kksiazek::jsi
