#include <jsi/jsi.h>

#include "tasks/tasks.hpp"

namespace kksiazek::jsi {

using namespace facebook::jsi;

void task13(facebook::jsi::Runtime &runtime) {
  const char *divideMeThisPropertyName = "divideMeThis";

  auto divideMeThis = [](jsi::Runtime &runtime,
                         const jsi::Value &thisValue,
                         const jsi::Value *args,
                         size_t count) -> jsi::Value {
    if (count < 2 || !args[0].isNumber() || !args[1].isNumber()) {
      throw jsi::JSError(
          runtime,
          "divideMeThis(a, b) requires 2 number arguments"
      );
    }

    double a = args[0].asNumber();
    double b = args[1].asNumber();

    if (b == 0.0) {
      throw jsi::JSError(runtime, "Cannot divide by zero");
    }

    return jsi::Value(a / b);
  };

  runtime.global().setProperty(
      runtime,
      divideMeThisPropertyName,
      jsi::Function::createFromHostFunction(
          runtime,
          jsi::PropNameID::forAscii(runtime, divideMeThisPropertyName),
          2,
          divideMeThis
      )
  );
}

} // namespace kksiazek::jsi
