#include <jsi/jsi.h>

#include "tasks/tasks.hpp"

namespace kksiazek::jsi {

using namespace facebook::jsi;

void task11(facebook::jsi::Runtime &runtime) {
  const char *sumMeThisObjectPropertyName = "sumMeThisObject";

  auto sumMeThisObject = [](jsi::Runtime &runtime,
                            const jsi::Value &thisValue,
                            const jsi::Value *args,
                            size_t count) -> jsi::Value {
    if (count < 1 || !args[0].isObject() ||
        args[0].asObject(runtime).isArray(runtime)) {
      throw jsi::JSError(
          runtime,
          "sumMeThisObject() requires an object { firstNum, lastNum }"
      );
    }

    jsi::Object input = args[0].asObject(runtime);
    jsi::Value firstVal = input.getProperty(runtime, "firstNum");
    jsi::Value lastVal = input.getProperty(runtime, "lastNum");

    if (!firstVal.isNumber() || !lastVal.isNumber()) {
      throw jsi::JSError(
          runtime,
          "sumMeThisObject() requires numeric firstNum and lastNum properties"
      );
    }

    double sum = firstVal.asNumber() + lastVal.asNumber();

    jsi::Object output(runtime);
    output.setProperty(runtime, "result", jsi::Value(sum));
    return output;
  };

  runtime.global().setProperty(
      runtime,
      sumMeThisObjectPropertyName,
      jsi::Function::createFromHostFunction(
          runtime,
          jsi::PropNameID::forAscii(runtime, sumMeThisObjectPropertyName),
          1,
          sumMeThisObject
      )
  );
}

} // namespace kksiazek::jsi
