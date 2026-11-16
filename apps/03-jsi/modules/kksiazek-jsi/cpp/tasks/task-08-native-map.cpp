#include <jsi/jsi.h>

#include "tasks/tasks.hpp"

namespace kksiazek::jsi {

using namespace facebook::jsi;

void task8(facebook::jsi::Runtime &runtime) {
  const char *nativeMapPropertyName = "nativeMap";

  auto nativeMap = [](jsi::Runtime &runtime,
                      const jsi::Value &thisValue,
                      const jsi::Value *args,
                      size_t count) -> jsi::Value {
    if (count < 2) {
      throw jsi::JSError(
          runtime,
          "nativeMap() requires 2 arguments (array, callback)"
      );
    }

    if (!args[0].isObject() || !args[0].asObject(runtime).isArray(runtime)) {
      throw jsi::JSError(
          runtime,
          "nativeMap() requires an array as the first argument"
      );
    }

    if (!args[1].isObject() || !args[1].asObject(runtime).isFunction(runtime)) {
      throw jsi::JSError(
          runtime,
          "nativeMap() requires a function as the second argument"
      );
    }

    jsi::Array input = args[0].asObject(runtime).asArray(runtime);
    jsi::Function callback = args[1].asObject(runtime).asFunction(runtime);
    size_t length = input.size(runtime);

    jsi::Array output(runtime, length);

    for (size_t i = 0; i < length; i++) {
      jsi::Value item = input.getValueAtIndex(runtime, i);
      if (!item.isNumber()) {
        throw jsi::JSError(
            runtime,
            "nativeMap() requires all array elements to be numbers"
        );
      }

      jsi::Value mapped = callback.call(runtime, item);
      output.setValueAtIndex(runtime, i, mapped);
    }

    return output;
  };

  runtime.global().setProperty(
      runtime,
      nativeMapPropertyName,
      jsi::Function::createFromHostFunction(
          runtime,
          jsi::PropNameID::forAscii(runtime, nativeMapPropertyName),
          2,
          nativeMap
      )
  );
}

} // namespace kksiazek::jsi