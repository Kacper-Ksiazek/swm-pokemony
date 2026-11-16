#include <jsi/jsi.h>
#include <string>

#include "tasks/tasks.hpp"

namespace kksiazek::jsi {

using namespace facebook::jsi;

void task6(facebook::jsi::Runtime &runtime) {
  const char *calculatePropertyName = "calculate";

  auto calculate = [](jsi::Runtime &runtime,
                      const jsi::Value &thisValue,
                      const jsi::Value *args,
                      size_t count) -> jsi::Value {
    if (count < 2) {
      throw jsi::JSError(runtime, "calculate() requires at least 2 arguments");
    }

    if (!args[0].isObject() || !args[0].asObject(runtime).isArray(runtime)) {
      throw jsi::JSError(
          runtime,
          "calculate() requires an array of numbers as the first argument"
      );
    }

    jsi::Array array = args[0].asObject(runtime).asArray(runtime);
    size_t arrayLength = array.length(runtime);

    if (arrayLength < 2) {
      throw jsi::JSError(
          runtime,
          "calculate() requires an array of at least 2 numbers as the first "
          "argument"
      );
    }

    if (!args[1].isString()) {
      throw jsi::JSError(
          runtime,
          "calculate() requires a string as the second argument"
      );
    }

    std::string operation = args[1].asString(runtime).utf8(runtime);

    if (operation != "add" && operation != "subtract" &&
        operation != "multiply") {
      throw jsi::JSError(
          runtime,
          "calculate() requires a string of 'add', 'subtract', or 'multiply' "
          "as the second argument"
      );
    }

    auto readNumber = [&runtime, &array](size_t index) -> double {
      jsi::Value value = array.getValueAtIndex(runtime, index);

      if (!value.isNumber()) {
        throw jsi::JSError(
            runtime,
            "calculate() requires a number at index " + std::to_string(index)
        );
      }

      return value.asNumber();
    };

    double result = readNumber(0);

    for (size_t i = 1; i < arrayLength; i++) {
      double number = readNumber(i);

      if (operation == "add") {
        result += number;
      } else if (operation == "subtract") {
        result -= number;
      } else if (operation == "multiply") {
        result *= number;
      }
    }

    return jsi::Value(result);
  };

  runtime.global().setProperty(
      runtime,
      calculatePropertyName,
      jsi::Function::createFromHostFunction(
          runtime,
          jsi::PropNameID::forAscii(runtime, calculatePropertyName),
          2,
          calculate
      )
  );
}

} // namespace kksiazek::jsi