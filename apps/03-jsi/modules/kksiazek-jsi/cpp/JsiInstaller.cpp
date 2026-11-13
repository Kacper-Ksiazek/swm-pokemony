#include <algorithm>
#include <cctype>
#include <jsi/jsi.h>
#include <memory>
#include <random>

#include "JsiInstaller.hpp"

namespace kksiazek::jsi {

using namespace facebook::jsi;

static void jsLog(jsi::Runtime &runtime, const std::string message) {
  auto console = runtime.global().getPropertyAsObject(runtime, "console");
  auto log = console.getPropertyAsFunction(runtime, "log");

  log.call(runtime, jsi::String::createFromUtf8(runtime, "[C++] " + message));
}

void main(facebook::jsi::Runtime &runtime) {
  jsLog(runtime, "Starting JSI workshop");

  task1(runtime);
  task2(runtime);
  task3(runtime);
  task4(runtime);
  task5(runtime);
  task6(runtime);
  task7(runtime);

  const char *readinessGatePropertyName = "__kksiazekJsiReady";
  runtime.global().setProperty(runtime, readinessGatePropertyName, true);
}

// Inject int 42 onto the JS global.
void task1(facebook::jsi::Runtime &runtime) {
  runtime.global().setProperty(
      runtime,
      "answerToTheUltimateQuestionOfLifeTheUniverseAndEverything",
      jsi::Value(42)
  );
}

// Inject `false` onto the JS global.
void task2(facebook::jsi::Runtime &runtime) {
  const char *propertyName = "isWednesday";

  jsi::Value value = jsi::Value(false);

  runtime.global().setProperty(runtime, propertyName, value);
}

// Inject string into JS global.
void task3(facebook::jsi::Runtime &runtime) {
  const char *propertyName = "workshopName";

  jsi::Value value =
      facebook::jsi::String::createFromUtf8(runtime, "JSI workshop");

  runtime.global().setProperty(runtime, propertyName, value);
}

// Inject array into JS global context
void task4(facebook::jsi::Runtime &runtime) {
  const char *propertyName = "myAwesomeArray";

  jsi::Array arrayValue(runtime, 3);

  arrayValue.setValueAtIndex(runtime, 0, 42);
  arrayValue.setValueAtIndex(runtime, 1, true);
  arrayValue.setValueAtIndex(
      runtime,
      2,
      jsi::String::createFromUtf8(runtime, "JSI workshop")
  );

  runtime.global().setProperty(runtime, propertyName, arrayValue);
}

//
//
//
// Stretch 1 - Counter

void task5(facebook::jsi::Runtime &runtime) {
  auto counter = std::make_shared<int>(0);

  const char *counterPropertyName = "counter";
  const char *incrementPropertyName = "increment";
  const char *decrementPropertyName = "decrement";

  auto syncCounter = [counter,
                      counterPropertyName](jsi::Runtime &runtime) -> void {
    runtime.global()
        .setProperty(runtime, counterPropertyName, jsi::Value(*counter));
  };

  auto increment = [counter, syncCounter](
                       jsi::Runtime &runtime,
                       const jsi::Value &thisValue,
                       const jsi::Value *args,
                       size_t count
                   ) -> jsi::Value {
    *counter += 1;
    syncCounter(runtime);

    return jsi::Value(*counter);
  };

  auto decrement = [counter, syncCounter](
                       jsi::Runtime &runtime,
                       const jsi::Value &thisValue,
                       const jsi::Value *args,
                       size_t count
                   ) -> jsi::Value {
    *counter -= 1;
    syncCounter(runtime);

    return jsi::Value(*counter);
  };

  syncCounter(runtime);

  runtime.global().setProperty(
      runtime,
      incrementPropertyName,
      jsi::Function::createFromHostFunction(
          runtime,
          jsi::PropNameID::forAscii(runtime, incrementPropertyName),
          0,
          increment
      )
  );

  runtime.global().setProperty(
      runtime,
      decrementPropertyName,
      jsi::Function::createFromHostFunction(
          runtime,
          jsi::PropNameID::forAscii(runtime, decrementPropertyName),
          0,
          decrement
      )
  );
}

//
//
//
// Stretch 2 - Calculator

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
};

void task7(facebook::jsi::Runtime &runtime) {
  const char *transformStringPropertyName = "transformString";

  auto transformString = [](jsi::Runtime &runtime,
                            const jsi::Value &thisValue,
                            const jsi::Value *args,
                            size_t count) -> jsi::Value {
    if (count < 2) {
      throw jsi::JSError(
          runtime,
          "transformString() requires at least 2 arguments"
      );
    }

    if (!args[0].isString()) {
      throw jsi::JSError(
          runtime,
          "transformString() requires a string as the first argument"
      );
    }

    std::string str = args[0].asString(runtime).utf8(runtime);

    if (str.length() < 2 || str.length() > 100) {
      throw jsi::JSError(
          runtime,
          "transformString() requires a string between 2 and 100 characters"
      );
    }

    if (!args[1].isString()) {
      throw jsi::JSError(
          runtime,
          "transformString() requires a string as the second argument"
      );
    }

    std::string operation = args[1].asString(runtime).utf8(runtime);

    if (operation != "uppercase" && operation != "lowercase" &&
        operation != "reverse" && operation != "capitalize" &&
        operation != "shuffle" && operation != "blur") {
      throw jsi::JSError(
          runtime,
          "transformString() requires a string of 'uppercase', 'lowercase', "
          "'reverse', 'capitalize', 'shuffle', or 'blur' as the second argument"
      );
    }

    if (operation == "uppercase") {
      std::transform(str.begin(), str.end(), str.begin(), [](unsigned char c) {
        return static_cast<char>(std::toupper(c));
      });
    } else if (operation == "lowercase") {
      std::transform(str.begin(), str.end(), str.begin(), [](unsigned char c) {
        return static_cast<char>(std::tolower(c));
      });
    } else if (operation == "reverse") {
      std::reverse(str.begin(), str.end());
    } else if (operation == "capitalize") {
      str[0] = static_cast<char>(
          std::toupper(static_cast<unsigned char>(str[0]))
      );
    } else if (operation == "shuffle") {
      std::mt19937 rng{std::random_device{}()};
      std::shuffle(str.begin(), str.end(), rng);
    } else if (operation == "blur") {
      for (size_t i = 1; i + 1 < str.length(); i++) {
        if (str[i] != ' ') {
          str[i] = '*';
        }
      }
    }

    return jsi::String::createFromUtf8(runtime, str);
  };

  runtime.global().setProperty(
      runtime,
      transformStringPropertyName,
      jsi::Function::createFromHostFunction(
          runtime,
          jsi::PropNameID::forAscii(runtime, transformStringPropertyName),
          2,
          transformString
      )
  );
}

} // namespace kksiazek::jsi
