#include <algorithm>
#include <cctype>
#include <jsi/jsi.h>
#include <random>
#include <string>

#include "tasks/tasks.hpp"

namespace kksiazek::jsi {

using namespace facebook::jsi;

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
      str[0] =
          static_cast<char>(std::toupper(static_cast<unsigned char>(str[0])));
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